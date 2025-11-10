// app/api/customers/[email]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { formatCurrency } from '@/lib/booking-utils';

// Get customer profile by email
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  try {
    const { user, error } = await authenticateUser(request);
    const { email } = await context.params;

    if (error) {
      return error;
    }

    const decodedEmail  = decodeURIComponent(email).toLowerCase();

    // Get all bookings for this customer
    const bookings = await prisma.booking.findMany({
      where: {
        guestEmail: decodedEmail,
      },
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
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate customer statistics
    const stats = {
      totalBookings: bookings.length,
      completedBookings: bookings.filter((b) => b.status === 'CHECKED_OUT')
        .length,
      confirmedBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
      cancelledBookings: bookings.filter((b) => b.status === 'CANCELLED').length,
      upcomingBookings: bookings.filter(
        (b) =>
          (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
          new Date(b.checkInDate) > new Date()
      ).length,
      totalSpent: bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount),
        0
      ),
      totalPaid: bookings.reduce(
        (sum, booking) => sum + Number(booking.paidAmount),
        0
      ),
      averageBookingValue:
        bookings.length > 0
          ? bookings.reduce(
              (sum, booking) => sum + Number(booking.totalAmount),
              0
            ) / bookings.length
          : 0,
      totalNights: bookings.reduce((sum, booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + nights;
      }, 0),
    };

    // Determine loyalty tier
    let loyaltyTier = 'New';
    let discount = 0;
    if (stats.completedBookings >= 10) {
      loyaltyTier = 'VIP';
      discount = 15; // 15% discount
    } else if (stats.completedBookings >= 5) {
      loyaltyTier = 'Gold';
      discount = 10; // 10% discount
    } else if (stats.completedBookings >= 2) {
      loyaltyTier = 'Silver';
      discount = 5; // 5% discount
    }

    // Get customer info from most recent booking
    const latestBooking = bookings[0];
    const customerProfile = {
      firstName: latestBooking.guestFirstName,
      lastName: latestBooking.guestLastName,
      email: latestBooking.guestEmail,
      phone: latestBooking.guestPhone,
      country: latestBooking.guestCountry,
      idType: latestBooking.guestIdType,
      idNumber: latestBooking.guestIdNumber,
    };

    // Calculate loyalty points (100 points per completed booking)
    const loyaltyPoints = stats.completedBookings * 100;

    // Get favorite room types
    const roomTypeFrequency = new Map();
    bookings.forEach((booking) => {
      booking.rooms.forEach((bookingRoom) => {
        const roomTypeName = bookingRoom.room.roomType.name;
        roomTypeFrequency.set(
          roomTypeName,
          (roomTypeFrequency.get(roomTypeName) || 0) + 1
        );
      });
    });

    const favoriteRoomTypes = Array.from(roomTypeFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, bookingCount: count }));

    // Get last visit and next visit
    const completedBookings = bookings.filter((b) => b.status === 'CHECKED_OUT');
    const lastVisit = completedBookings.length > 0 ? completedBookings[0].checkOutDate : null;

    const upcomingBookings = bookings.filter(
      (b) =>
        (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
        new Date(b.checkInDate) > new Date()
    );
    const nextVisit = upcomingBookings.length > 0 ? upcomingBookings[0].checkInDate : null;

    // Format bookings for response
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      numberOfAdults: booking.numberOfAdults,
      numberOfChildren: booking.numberOfChildren,
      totalAmount: Number(booking.totalAmount),
      paidAmount: Number(booking.paidAmount),
      status: booking.status,
      rooms: booking.rooms.map((br) => ({
        roomNumber: br.room.roomNumber,
        roomType: br.room.roomType.name,
        pricePerNight: Number(br.ratePerNight),
      })),
      paymentsCount: booking.payments.length,
      servicesCount: booking.services.length,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json(
      {
        profile: customerProfile,
        stats,
        loyalty: {
          tier: loyaltyTier,
          points: loyaltyPoints,
          discount: discount,
          nextTier:
            loyaltyTier === 'New'
              ? 'Silver (2 bookings)'
              : loyaltyTier === 'Silver'
              ? 'Gold (5 bookings)'
              : loyaltyTier === 'Gold'
              ? 'VIP (10 bookings)'
              : 'Max tier reached',
        },
        favoriteRoomTypes,
        lastVisit,
        nextVisit,
        bookings: formattedBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get customer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}