// app/api/bookings/[id]/payment-method/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidPaymentMethod, BookingStatus } from '@/lib/constant';

// Update payment method for a booking (PUBLIC ACCESS - no auth required for guests)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { paymentMethod } = body;

    // Validate payment method
    if (!paymentMethod || !isValidPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { error: 'Valid payment method is required' },
        { status: 400 }
      );
    }

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
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

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow updating if booking is still PENDING
    if (existingBooking.status !== BookingStatus.PENDING) {
      return NextResponse.json(
        { error: 'Cannot update payment method for non-pending booking' },
        { status: 400 }
      );
    }

    // Update booking payment method
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        paymentMethod,
        updatedAt: new Date(),
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

    return NextResponse.json(
      {
        message: 'Payment method updated successfully',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}