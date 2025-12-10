// app/api/bookings/[id]/guest-edit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@/lib/constant';
import { validateBookingDates } from '@/lib/booking-utils';

// Allow guests to edit their own bookings (no auth required)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const {
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      specialRequests,
    } = body;

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow editing PENDING or CONFIRMED bookings
    if (
      existingBooking.status !== BookingStatus.PENDING &&
      existingBooking.status !== BookingStatus.CONFIRMED
    ) {
      return NextResponse.json(
        { error: 'This booking cannot be edited' },
        { status: 400 }
      );
    }

    // Validate dates if they're being changed
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      const dateValidation = validateBookingDates(checkIn, checkOut);
      if (!dateValidation.isValid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        );
      }

      // Check if dates changed and if rooms are still available
      const datesChanged =
        checkIn.getTime() !== existingBooking.checkInDate.getTime() ||
        checkOut.getTime() !== existingBooking.checkOutDate.getTime();

      if (datesChanged) {
        // Check if all booked rooms are available for new dates
        const roomIds = existingBooking.rooms.map((r) => r.roomId);

        for (const roomId of roomIds) {
          // Check for conflicts
          const conflicts = await prisma.bookingRoom.findFirst({
            where: {
              roomId,
              booking: {
                id: { not: id }, // Exclude current booking
                status: {
                  in: [
                    BookingStatus.CONFIRMED,
                    BookingStatus.CHECKED_IN,
                    BookingStatus.PENDING,
                  ],
                },
                OR: [
                  {
                    AND: [
                      { checkInDate: { lte: checkIn } },
                      { checkOutDate: { gt: checkIn } },
                    ],
                  },
                  {
                    AND: [
                      { checkInDate: { lt: checkOut } },
                      { checkOutDate: { gte: checkOut } },
                    ],
                  },
                  {
                    AND: [
                      { checkInDate: { gte: checkIn } },
                      { checkOutDate: { lte: checkOut } },
                    ],
                  },
                ],
              },
            },
          });

          if (conflicts) {
            return NextResponse.json(
              {
                error: 'One or more rooms are not available for the selected dates',
              },
              { status: 400 }
            );
          }
        }

        // Recalculate pricing if dates changed
        // You may want to add this logic based on your pricing structure
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (guestFirstName) updateData.guestFirstName = guestFirstName;
    if (guestLastName) updateData.guestLastName = guestLastName;
    if (guestEmail) updateData.guestEmail = guestEmail.toLowerCase();
    if (guestPhone) updateData.guestPhone = guestPhone;
    if (checkInDate) updateData.checkInDate = new Date(checkInDate);
    if (checkOutDate) updateData.checkOutDate = new Date(checkOutDate);
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;

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

    return NextResponse.json(
      {
        message: 'Booking updated successfully',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Guest edit booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}