// app/api/bookings/[id]/price-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateUser(request);
    const { id } = await context.params;

    if (error) {
      return error;
    }

    const body = await request.json();
    const { newCheckInDate, newCheckOutDate, numberOfAdults } = body;

    // Get existing booking with full details
    const booking = await prisma.booking.findUnique({
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

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // CURRENT booking details
    const currentCheckIn = new Date(booking.checkInDate);
    const currentCheckOut = new Date(booking.checkOutDate);
    const currentNights = Math.ceil(
      (currentCheckOut.getTime() - currentCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentAdults = booking.numberOfAdults;

    // NEW booking details
    const newCheckIn = new Date(newCheckInDate);
    const newCheckOut = new Date(newCheckOutDate);
    const newNights = Math.ceil(
      (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const newAdults = numberOfAdults || currentAdults;

    // Determine pricing region
    const eastAfricanCountries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'];
    const isEastAfrican = eastAfricanCountries.includes(booking.guestCountry || 'Kenya');

    // Calculate ORIGINAL and NEW totals
    let originalTotal = 0;
    let newTotal = 0;
    const roomBreakdown = [];

    for (const bookingRoom of booking.rooms) {
      const roomType = bookingRoom.room.roomType;
      
      // CURRENT/ORIGINAL PRICING (from RoomType table)
      const currentOccupancy = currentAdults === 1 ? 'single' : 'double';
      let currentPricePerNight: number;
      
      if (isEastAfrican) {
        currentPricePerNight = currentAdults === 1 
          ? Number(roomType.singlePriceEA) 
          : Number(roomType.doublePriceEA);
      } else {
        currentPricePerNight = currentAdults === 1 
          ? Number(roomType.singlePriceIntl) 
          : Number(roomType.doublePriceIntl);
      }
      const currentRoomTotal = currentPricePerNight * currentNights;
      originalTotal += currentRoomTotal;

      // NEW PRICING (from RoomType table)
      const newOccupancy = newAdults === 1 ? 'single' : 'double';
      let newPricePerNight: number;
      
      if (isEastAfrican) {
        newPricePerNight = newAdults === 1 
          ? Number(roomType.singlePriceEA) 
          : Number(roomType.doublePriceEA);
      } else {
        newPricePerNight = newAdults === 1 
          ? Number(roomType.singlePriceIntl) 
          : Number(roomType.doublePriceIntl);
      }
      const newRoomTotal = newPricePerNight * newNights;
      newTotal += newRoomTotal;

      roomBreakdown.push({
        roomNumber: bookingRoom.room.roomNumber,
        roomType: roomType.name,
        roomTypeId: roomType.id,
        // All pricing from RoomType table
        singlePriceEA: Number(roomType.singlePriceEA),
        doublePriceEA: Number(roomType.doublePriceEA),
        singlePriceIntl: Number(roomType.singlePriceIntl),
        doublePriceIntl: Number(roomType.doublePriceIntl),
        // Current calculation
        oldPrice: currentRoomTotal,
        oldPricePerNight: currentPricePerNight,
        oldNights: currentNights,
        oldOccupancy: currentOccupancy,
        // New calculation
        newPrice: newRoomTotal,
        newPricePerNight: newPricePerNight,
        newNights,
        newOccupancy,
      });
    }

    const difference = newTotal - originalTotal;

    return NextResponse.json(
      {
        priceBreakdown: {
          originalTotal,
          newTotal,
          difference,
          originalNights: currentNights,
          newNights,
          originalAdults: currentAdults,
          newAdults,
          isEastAfrican,
          currency: isEastAfrican ? 'KES' : 'USD',
          rooms: roomBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Price check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}