import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, RoomStatus } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const noonToday = new Date(now);
    noonToday.setHours(12, 0, 0, 0);

    // Find pending bookings where check-in date has passed
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        checkInDate: {
          lt: noonToday,
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

    let cancelledCount = 0;
    const results = [];

    for (const booking of expiredBookings) {
      try {
        // Cancel the booking
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELLED,
          },
        });

        // Release the rooms back to available
        const roomIds = booking.rooms.map((br) => br.roomId);
        await prisma.room.updateMany({
          where: {
            id: { in: roomIds },
          },
          data: {
            status: RoomStatus.AVAILABLE,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'AUTO_CANCEL_EXPIRED',
            entityType: 'Booking',
            entityId: booking.id,
            details: JSON.stringify({
              bookingNumber: booking.bookingNumber,
              checkInDate: booking.checkInDate,
              reason: 'Expired - check-in date passed without confirmation',
              roomIds,
              autoCancelTime: now.toISOString(),
            }),
          },
        });

        cancelledCount++;
        results.push({
          bookingNumber: booking.bookingNumber,
          status: 'cancelled',
        });
      } catch (error) {
        console.error(`Failed to cancel expired booking ${booking.bookingNumber}:`, error);
        results.push({
          bookingNumber: booking.bookingNumber,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Expired bookings cancelled',
        cancelled: cancelledCount,
        total: expiredBookings.length,
        timestamp: now.toISOString(),
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel expired bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}