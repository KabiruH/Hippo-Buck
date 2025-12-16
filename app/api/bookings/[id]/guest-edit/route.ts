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
      numberOfAdults,
      numberOfChildren,
      specialRequests,
    } = body;

    // Get existing booking with full details
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

    // Validate guest count if provided
    if (numberOfAdults !== undefined && numberOfChildren !== undefined) {
      if (numberOfAdults + numberOfChildren > 2) {
        return NextResponse.json(
          { error: 'Maximum 2 guests per room allowed' },
          { status: 400 }
        );
      }
      if (numberOfAdults < 1) {
        return NextResponse.json(
          { error: 'At least 1 adult is required' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    let pricingChanged = false;
    let newTotalAmount = Number(existingBooking.totalAmount);
    const updatedRooms = [];

    if (guestFirstName) updateData.guestFirstName = guestFirstName;
    if (guestLastName) updateData.guestLastName = guestLastName;
    if (guestEmail) updateData.guestEmail = guestEmail.toLowerCase();
    if (guestPhone) updateData.guestPhone = guestPhone;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;

    // Handle date and occupancy changes
    const newCheckIn = checkInDate ? new Date(checkInDate) : existingBooking.checkInDate;
    const newCheckOut = checkOutDate ? new Date(checkOutDate) : existingBooking.checkOutDate;
    const newAdults = numberOfAdults !== undefined ? numberOfAdults : existingBooking.numberOfAdults;
    const newChildren = numberOfChildren !== undefined ? numberOfChildren : existingBooking.numberOfChildren;

    // Check if dates changed
    const datesChanged =
      newCheckIn.getTime() !== existingBooking.checkInDate.getTime() ||
      newCheckOut.getTime() !== existingBooking.checkOutDate.getTime();

    // Check if occupancy changed
    const occupancyChanged = newAdults !== existingBooking.numberOfAdults;

    pricingChanged = datesChanged || occupancyChanged;

    // Validate dates if they're being changed
    if (checkInDate && checkOutDate) {
      const dateValidation = validateBookingDates(newCheckIn, newCheckOut);
      if (!dateValidation.isValid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        );
      }

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
                      { checkInDate: { lte: newCheckIn } },
                      { checkOutDate: { gt: newCheckIn } },
                    ],
                  },
                  {
                    AND: [
                      { checkInDate: { lt: newCheckOut } },
                      { checkOutDate: { gte: newCheckOut } },
                    ],
                  },
                  {
                    AND: [
                      { checkInDate: { gte: newCheckIn } },
                      { checkOutDate: { lte: newCheckOut } },
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
      }
    }

    // Recalculate pricing if dates or occupancy changed
    if (pricingChanged) {
      const nights = Math.ceil(
        (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine pricing region
      const eastAfricanCountries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'];
      const isEastAfrican = eastAfricanCountries.includes(existingBooking.guestCountry || 'Kenya');

      newTotalAmount = 0;

      // Calculate new pricing for each room
      for (const bookingRoom of existingBooking.rooms) {
        const roomType = bookingRoom.room.roomType;
        
        // Get price based on occupancy and region
        let pricePerNight: number;
        
        if (isEastAfrican) {
          pricePerNight = newAdults === 1 
            ? Number(roomType.singlePriceEA) 
            : Number(roomType.doublePriceEA);
        } else {
          pricePerNight = newAdults === 1 
            ? Number(roomType.singlePriceIntl) 
            : Number(roomType.doublePriceIntl);
        }

        const newRoomPrice = pricePerNight * nights;
        newTotalAmount += newRoomPrice;

        updatedRooms.push({
          id: bookingRoom.id,
          ratePerNight: pricePerNight,
          numberOfNights: nights,
          totalPrice: newRoomPrice,
        });
      }

      updateData.totalAmount = newTotalAmount;
    }

    // Update dates if changed
    if (checkInDate) updateData.checkInDate = newCheckIn;
    if (checkOutDate) updateData.checkOutDate = newCheckOut;
    if (numberOfAdults !== undefined) updateData.numberOfAdults = newAdults;
    if (numberOfChildren !== undefined) updateData.numberOfChildren = newChildren;

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Update room pricing if changed
    if (pricingChanged && updatedRooms.length > 0) {
      for (const room of updatedRooms) {
        await prisma.bookingRoom.update({
          where: { id: room.id },
          data: {
            ratePerNight: room.ratePerNight,
            numberOfNights: room.numberOfNights,
            totalPrice: room.totalPrice,
          },
        });
      }
    }

    // Get final booking with all relations
    const finalBooking = await prisma.booking.findUnique({
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
        payments: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Booking updated successfully',
        booking: finalBooking,
        priceChanged: pricingChanged,
        oldTotal: Number(existingBooking.totalAmount),
        newTotal: newTotalAmount,
        difference: newTotalAmount - Number(existingBooking.totalAmount),
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