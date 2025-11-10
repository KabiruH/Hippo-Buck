// app/api/bookings/[id]/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { BookingStatus, RoomStatus } from '@/lib/constant';

// Check-in a booking
export async function POST(
  request: NextRequest,
context: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await authenticateUser(request);
    const { id } = await context.params; // 👈 await the Promise
    if (error) {
      return error;
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate booking can be checked in
    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json(
        {
          error: `Booking must be confirmed before check-in. Current status: ${booking.status}`,
        },
        { status: 400 }
      );
    }

    // Check if check-in date is valid (not too early)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate > today) {
      return NextResponse.json(
        { error: 'Check-in date has not arrived yet' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CHECKED_IN,
        actualCheckIn: new Date(),
        modifiedById: user!.userId,
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
      },
    });

    // Update room status to OCCUPIED
    const roomIds = booking.rooms.map((r) => r.roomId);
    await prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: RoomStatus.OCCUPIED },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'CHECK_IN',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
          checkInTime: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Check-in successful',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}