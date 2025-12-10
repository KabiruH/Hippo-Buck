import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, RoomStatus } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const noonToday = new Date(now);
    noonToday.setHours(12, 0, 0, 0);

    // Find all bookings that should be checked out
    // (checkout date is today or earlier, and still checked in or confirmed)
    const bookingsToCheckout = await prisma.booking.findMany({
      where: {
        checkOutDate: {
          lte: noonToday,
        },
        status: {
          in: [BookingStatus.CHECKED_IN, BookingStatus.CONFIRMED],
        },
      },
      include: {
        rooms: {
          include: {
            room: true,
          },
        },
      },
    });

    let checkedOutCount = 0;
    const results = [];

    for (const booking of bookingsToCheckout) {
      try {
        // Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CHECKED_OUT,
          },
        });

        // Update room statuses to CLEANING
        const roomIds = booking.rooms.map((br) => br.roomId);
        await prisma.room.updateMany({
          where: {
            id: { in: roomIds },
          },
          data: {
            status: RoomStatus.CLEANING,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'AUTO_CHECKOUT',
            entityType: 'Booking',
            entityId: booking.id,
            details: JSON.stringify({
              bookingNumber: booking.bookingNumber,
              checkOutDate: booking.checkOutDate,
              roomIds,
              autoCheckoutTime: now.toISOString(),
            }),
          },
        });

        checkedOutCount++;
        results.push({
          bookingNumber: booking.bookingNumber,
          status: 'success',
        });
      } catch (error) {
        console.error(`Failed to auto-checkout booking ${booking.bookingNumber}:`, error);
        results.push({
          bookingNumber: booking.bookingNumber,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Auto-checkout completed',
        checkedOut: checkedOutCount,
        total: bookingsToCheckout.length,
        timestamp: now.toISOString(),
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auto-checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}