// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import {
  generateBookingNumber,
  validateBookingDates,
  calculateRoomPrice,
  findAvailableRooms,
} from '@/lib/booking-utils';
import { BookingStatus, PaymentMethod } from '@/lib/constant';

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
      roomIds, // Array of room IDs to book
      paymentMethod,
      paidAmount = 0,
      specialRequests,
      manualConfirm = false, // Staff can manually confirm without payment
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
      !roomIds ||
      roomIds.length === 0
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

    // Verify all rooms are available
    const availableRooms = await findAvailableRooms(
      checkIn,
      checkOut,
      undefined,
      prisma
    );
    const availableRoomIds = availableRooms.map((r) => r.id);

    for (const roomId of roomIds) {
      if (!availableRoomIds.includes(roomId)) {
        return NextResponse.json(
          { error: `Room ${roomId} is not available for selected dates` },
          { status: 400 }
        );
      }
    }

    // Calculate total price for all rooms
    let totalAmount = 0;
    const roomBookingData = [];

    for (const roomId of roomIds) {
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
      // Staff can manually confirm booking regardless of payment
      bookingStatus = BookingStatus.CONFIRMED;
    } else if (paidAmount >= totalAmount) {
      // Full payment received - auto confirm
      bookingStatus = BookingStatus.CONFIRMED;
    } else {
      // No payment or partial payment - keep pending
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

    // Only add createdById if user is authenticated (staff booking)
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
      where: { id: { in: roomIds } },
      data: { status: 'RESERVED' },
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

    // Log activity only if it's a staff booking
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
            roomCount: roomIds.length,
            status: bookingStatus,
          }),
        },
      });
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

// Get all bookings (PUBLIC ACCESS for booking lookup by customers)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const bookingNumber = searchParams.get('bookingNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Check if this is a customer lookup (by email or booking number)
    const isCustomerLookup = email || bookingNumber;

    // If not a customer lookup, require authentication for staff
    if (!isCustomerLookup) {
      const { user, error } = await authenticateUser(request);
      if (error) {
        return error;
      }
    }

    // Build where clause
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