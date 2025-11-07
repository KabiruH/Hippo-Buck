// app/api/rooms/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findAvailableRooms, calculateRoomPrice } from '@/lib/booking-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const roomTypeId = searchParams.get('roomTypeId') || undefined;

    // Validation
    if (!checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Find available rooms
    const availableRooms = await findAvailableRooms(
      checkIn,
      checkOut,
      roomTypeId,
      prisma
    );

    // Calculate pricing for each room type
    const roomsWithPricing = await Promise.all(
      availableRooms.map(async (room) => {
        const pricing = await calculateRoomPrice(
          room.roomTypeId,
          checkIn,
          checkOut,
          prisma
        );

        // Get amenities and images
        const amenities = await prisma.roomAmenity.findMany({
          where: { roomTypeId: room.roomTypeId },
        });

        const images = await prisma.roomImage.findMany({
          where: { roomTypeId: room.roomTypeId },
          orderBy: { displayOrder: 'asc' },
        });

        return {
          room: {
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            status: room.status,
          },
          roomType: {
            id: room.roomType.id,
            name: room.roomType.name,
            slug: room.roomType.slug,
            description: room.roomType.description,
            maxOccupancy: room.roomType.maxOccupancy,
            bedType: room.roomType.bedType,
            size: room.roomType.size,
          },
          pricing: {
            pricePerNight: pricing.pricePerNight,
            totalPrice: pricing.totalPrice,
            nights: pricing.nights,
          },
          amenities: amenities.map((a) => a.amenity),
          images: images.map((img) => ({
            url: img.imageUrl,
            isPrimary: img.isPrimary,
          })),
        };
      })
    );

    return NextResponse.json(
      {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        availableRooms: roomsWithPricing,
        totalAvailable: roomsWithPricing.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get available rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}