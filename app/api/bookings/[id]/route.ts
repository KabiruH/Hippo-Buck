// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { BookingStatus } from '@/lib/constant';

// Get single booking by ID (PUBLIC ACCESS for customers)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Allow public access - no authentication required
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                roomType: {
                  include: {
                    amenities: true,
                    images: true,
                  },
                },
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

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update booking (REQUIRES AUTHENTICATION)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
  ) {
  try {
    const { id } = await context.params;
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const body = await request.json();
    const {
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      guestCountry,
      guestIdType,
      guestIdNumber,
      numberOfAdults,
      numberOfChildren,
      specialRequests,
      status,
    } = body;

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      modifiedById: user!.userId,
    };

    if (guestFirstName) updateData.guestFirstName = guestFirstName;
    if (guestLastName) updateData.guestLastName = guestLastName;
    if (guestEmail) updateData.guestEmail = guestEmail.toLowerCase();
    if (guestPhone) updateData.guestPhone = guestPhone;
    if (guestCountry !== undefined) updateData.guestCountry = guestCountry;
    if (guestIdType !== undefined) updateData.guestIdType = guestIdType;
    if (guestIdNumber !== undefined) updateData.guestIdNumber = guestIdNumber;
    if (numberOfAdults) updateData.numberOfAdults = numberOfAdults;
    if (numberOfChildren !== undefined)
      updateData.numberOfChildren = numberOfChildren;
    if (specialRequests !== undefined)
      updateData.specialRequests = specialRequests;
    if (status) updateData.status = status;

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'BOOKING_UPDATED',
        entityType: 'Booking',
        entityId: updatedBooking.id,
        details: JSON.stringify({
          bookingNumber: updatedBooking.bookingNumber,
          changes: updateData,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Booking updated successfully',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel booking (REQUIRES AUTHENTICATION)
export async function DELETE(
  request: NextRequest,
    context: { params: Promise<{ id: string }> } 
) {
  try {
    const { user, error } = await authenticateUser(request);
const { id } = await context.params;
    if (error) {
      return error;
    }

    // Check if booking exists
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

    // Check if booking can be cancelled
    if (
      booking.status === BookingStatus.CHECKED_IN ||
      booking.status === BookingStatus.CHECKED_OUT
    ) {
      return NextResponse.json(
        { error: 'Cannot cancel checked-in or completed bookings' },
        { status: 400 }
      );
    }

    // Update booking status to CANCELLED
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        modifiedById: user!.userId,
      },
    });

    // Free up the rooms
    const roomIds = booking.rooms.map((r) => r.roomId);
    await prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: 'AVAILABLE' },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          guestEmail: booking.guestEmail,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Booking cancelled successfully',
        booking: cancelledBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}