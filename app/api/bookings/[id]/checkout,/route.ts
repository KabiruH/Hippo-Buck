// app/api/bookings/[id]/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { BookingStatus, RoomStatus } from '@/lib/constant';

// Check-out a booking
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        rooms: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate booking can be checked out
    if (booking.status !== BookingStatus.CHECKED_IN) {
      return NextResponse.json(
        {
          error: `Booking must be checked-in before check-out. Current status: ${booking.status}`,
        },
        { status: 400 }
      );
    }

    // Check for outstanding balance
    const totalPaid = booking.paidAmount;
    const totalAmount = Number(booking.totalAmount);
    const balance = totalAmount - Number(totalPaid);

    if (balance > 0) {
      return NextResponse.json(
        {
          error: `Outstanding balance of KES ${balance.toFixed(
            2
          )} must be paid before check-out`,
          balance,
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: BookingStatus.CHECKED_OUT,
        actualCheckOut: new Date(),
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
        payments: true,
      },
    });

    // Update room status to CLEANING
    const roomIds = booking.rooms.map((r) => r.roomId);
    await prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: RoomStatus.CLEANING },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'CHECK_OUT',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
          checkOutTime: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Check-out successful',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}