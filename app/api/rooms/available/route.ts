import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findAvailableRooms } from '@/lib/booking-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const roomTypeId = searchParams.get('roomTypeId') || undefined;
    const numberOfAdults = parseInt(searchParams.get('numberOfAdults') || '1');
    const guestCountry = searchParams.get('guestCountry') || 'Kenya';

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
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine if East African
    const eastAfricanCountries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'];
    const isEastAfrican = eastAfricanCountries.includes(guestCountry);

    // Find available rooms
    const availableRooms = await findAvailableRooms(checkIn, checkOut, roomTypeId, prisma);

    // Calculate pricing for each room type
    const roomsWithPricing = await Promise.all(
      availableRooms.map(async (room) => {
        // ✅ Get price from database based on occupancy and region
        let pricePerNight: number;
        
        if (isEastAfrican) {
          // East African rates (KES)
          pricePerNight = numberOfAdults === 1 
            ? Number(room.roomType.singlePriceEA) 
            : Number(room.roomType.doublePriceEA);
        } else {
          // International rates (USD)
          pricePerNight = numberOfAdults === 1 
            ? Number(room.roomType.singlePriceIntl) 
            : Number(room.roomType.doublePriceIntl);
        }

        const totalPrice = pricePerNight * nights;

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
            pricePerNight,
            totalPrice,
            nights,
          },
          amenities: amenities.map((a) => a.amenity),
          images: images.map((img) => ({
            url: img.imageUrl,
            isPrimary: img.isPrimary,
          })),
        };
      })
    );

    // Group by room type for easier booking creation
    const roomTypeMap = new Map<string, any>();

    roomsWithPricing.forEach((item) => {
      const typeId = item.roomType.id;
      if (!roomTypeMap.has(typeId)) {
        roomTypeMap.set(typeId, {
          id: item.roomType.id,
          name: item.roomType.name,
          slug: item.roomType.slug,
          description: item.roomType.description,
          maxOccupancy: item.roomType.maxOccupancy,
          bedType: item.roomType.bedType,
          size: item.roomType.size,
          pricePerNight: item.pricing.pricePerNight,
          totalPrice: item.pricing.totalPrice,
          nights: item.pricing.nights,
          availableRooms: 0,
          rooms: [],
          amenities: item.amenities,
          images: item.images,
        });
      }

      const roomTypeData = roomTypeMap.get(typeId);
      roomTypeData.availableRooms++;
      roomTypeData.rooms.push(item.room);
    });

    const availableRoomTypes = Array.from(roomTypeMap.values());

    return NextResponse.json(
      {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        isEastAfrican,
        numberOfAdults,
        availableRooms: roomsWithPricing, // Keep for backward compatibility
        availableRoomTypes, // Grouped by room type
        totalAvailable: roomsWithPricing.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get available rooms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}