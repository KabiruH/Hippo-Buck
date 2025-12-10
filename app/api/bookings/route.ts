import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import {
  sendBookingConfirmationToGuest,
  sendBookingNotificationToOrganization
} from '@/lib/email-service';
import {
  generateBookingNumber,
  validateBookingDates,
  calculateRoomPrice,
  findAvailableRooms,
} from '@/lib/booking-utils';
import { BookingStatus, PaymentMethod, RoomStatus } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create a new booking (PUBLIC ACCESS for customers)
export async function POST(request: NextRequest) {
  try {
    // Try to authenticate, but don't require it (for guest bookings)
    const { user } = await authenticateUser(request);
    const isStaffBooking = !!user;

    const body = await request.json();
    const {
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      guestCountry,
      guestIdType,
      guestIdNumber,
      checkInDate,
      checkOutDate,
      numberOfAdults,
      numberOfChildren = 0,
      roomIds, // ✅ Keep for backward compatibility
      roomTypes, // ✅ NEW: Array of { roomTypeId, quantity }
      paymentMethod,
      paidAmount = 0,
      specialRequests,
      manualConfirm = false,
    } = body;

    // Validation
    if (
      !guestFirstName ||
      !guestLastName ||
      !guestEmail ||
      !guestPhone ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfAdults ||
      (!roomIds && !roomTypes)
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    const dateValidation = validateBookingDates(checkIn, checkOut);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // ✅ Handle room type selection (NEW flow from CreateBookingDialog)
    let selectedRoomIds: string[] = [];
    
    if (roomTypes && Array.isArray(roomTypes)) {
      // Get available rooms for each room type
      for (const selectedType of roomTypes) {
        const { roomTypeId, quantity } = selectedType;

        // Find available rooms of this type
        const availableRooms = await findAvailableRooms(
          checkIn,
          checkOut,
          roomTypeId,
          prisma
        );

        if (availableRooms.length < quantity) {
          const roomTypeName = await prisma.roomType.findUnique({
            where: { id: roomTypeId },
            select: { name: true },
          });
          
          return NextResponse.json(
            {
              error: `Not enough rooms available for ${roomTypeName?.name || 'selected room type'}. Only ${availableRooms.length} available.`,
            },
            { status: 400 }
          );
        }

        // Take the required quantity
        const selectedRooms = availableRooms.slice(0, quantity);
        selectedRoomIds.push(...selectedRooms.map((r) => r.id));
      }
    } else if (roomIds && Array.isArray(roomIds)) {
      // ✅ Backward compatibility - direct room IDs
      selectedRoomIds = roomIds;
      
      // Verify all rooms are available
      const availableRooms = await findAvailableRooms(
        checkIn,
        checkOut,
        undefined,
        prisma
      );
      const availableRoomIds = availableRooms.map((r) => r.id);

      for (const roomId of selectedRoomIds) {
        if (!availableRoomIds.includes(roomId)) {
          return NextResponse.json(
            { error: `Room ${roomId} is not available for selected dates` },
            { status: 400 }
          );
        }
      }
    }

    // Calculate total price for all rooms
    let totalAmount = 0;
    const roomBookingData = [];

    for (const roomId of selectedRoomIds) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
      });

      if (!room) {
        return NextResponse.json(
          { error: `Room ${roomId} not found` },
          { status: 404 }
        );
      }

      const pricing = await calculateRoomPrice(
        room.roomTypeId,
        checkIn,
        checkOut,
        prisma
      );

      totalAmount += pricing.totalPrice;

      roomBookingData.push({
        roomId: room.id,
        ratePerNight: pricing.pricePerNight,
        numberOfNights: pricing.nights,
        totalPrice: pricing.totalPrice,
      });
    }

    // Generate unique booking number
    const bookingNumber = generateBookingNumber();

    // Determine booking status
    let bookingStatus: BookingStatus;

    if (isStaffBooking && manualConfirm) {
      bookingStatus = BookingStatus.CONFIRMED;
    } else if (paidAmount >= totalAmount) {
      bookingStatus = BookingStatus.CONFIRMED;
    } else {
      bookingStatus = BookingStatus.PENDING;
    }

    // Prepare booking data
    const bookingData: any = {
      bookingNumber,
      guestFirstName,
      guestLastName,
      guestEmail: guestEmail.toLowerCase(),
      guestPhone,
      guestCountry: guestCountry || null,
      guestIdType: guestIdType || null,
      guestIdNumber: guestIdNumber || null,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfAdults,
      numberOfChildren,
      totalAmount,
      paidAmount,
      status: bookingStatus,
      paymentMethod: paymentMethod || null,
      specialRequests: specialRequests || null,
      rooms: {
        create: roomBookingData,
      },
    };

    if (isStaffBooking && user) {
      bookingData.createdById = user.userId;
    }

    // Create booking with rooms
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update room status to RESERVED
    await prisma.room.updateMany({
      where: { id: { in: selectedRoomIds } },
      data: { status: RoomStatus.RESERVED },
    });

    // Create customer history record
    await prisma.customerHistory.create({
      data: {
        bookingId: booking.id,
        guestFirstName,
        guestLastName,
        guestEmail: guestEmail.toLowerCase(),
        guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount,
        status: bookingStatus,
      },
    });

    // Log activity
    if (isStaffBooking && user) {
      await prisma.activityLog.create({
        data: {
          userId: user.userId,
          action: 'BOOKING_CREATED',
          entityType: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            bookingNumber: booking.bookingNumber,
            guestEmail: booking.guestEmail,
            totalAmount: booking.totalAmount,
            roomCount: selectedRoomIds.length,
            status: bookingStatus,
          }),
        },
      });
    }

    // Send emails
    try {
      const room = booking.rooms[0]?.room?.roomType?.name || "Room";

      await sendBookingConfirmationToGuest({
        to: booking.guestEmail,
        bookingNumber: booking.bookingNumber,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        roomType: room,
        numberOfRooms: booking.rooms.length,
        numberOfGuests: booking.numberOfAdults + booking.numberOfChildren,
        checkInDate: booking.checkInDate.toString(),
        checkOutDate: booking.checkOutDate.toString(),
        nights: booking.rooms[0]?.numberOfNights ?? 1,
        totalAmount: booking.totalAmount?.toNumber?.() ?? 0,
        paymentMethod: booking.paymentMethod ?? undefined,
        specialRequests: booking.specialRequests ?? undefined,
        status: booking.status,
      });

      await sendBookingNotificationToOrganization({
        to: process.env.ORGANIZATION_EMAIL ?? "info@hotelhippobuck.com",
        bookingNumber: booking.bookingNumber,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        roomType: room,
        numberOfRooms: booking.rooms.length,
        numberOfGuests: booking.numberOfAdults + booking.numberOfChildren,
        checkInDate: booking.checkInDate.toString(),
        checkOutDate: booking.checkOutDate.toString(),
        nights: booking.rooms[0]?.numberOfNights ?? 1,
        totalAmount: booking.totalAmount?.toNumber?.() ?? 0,
        paymentMethod: booking.paymentMethod ?? undefined,
        specialRequests: booking.specialRequests ?? undefined,
        status: booking.status,
      });

      console.log("📧 Booking emails sent successfully");
    } catch (err) {
      console.error("❌ Error sending booking email(s):", err);
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all bookings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const bookingNumber = searchParams.get('bookingNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const isCustomerLookup = email || bookingNumber;

    if (!isCustomerLookup) {
      const { user, error } = await authenticateUser(request);
      if (error) {
        return error;
      }
    }

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (email) {
      where.guestEmail = email.toLowerCase();
    }

    if (bookingNumber) {
      where.bookingNumber = bookingNumber;
    }

    if (startDate && endDate) {
      where.checkInDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        payments: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        bookings,
        total: bookings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}