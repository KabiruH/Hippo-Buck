// app/api/room-types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return error;
    }

    const roomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        singlePriceEA: true,    // ✅ East African Single
        doublePriceEA: true,    // ✅ East African Double
        singlePriceIntl: true,  // ✅ International Single (USD)
        doublePriceIntl: true,  // ✅ International Double (USD)
        maxOccupancy: true,
        bedType: true,
        size: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        roomTypes: roomTypes.map((rt) => ({
          id: rt.id,
          name: rt.name,
          slug: rt.slug,
          description: rt.description,
          pricing: {
            eastAfrican: {
              single: Number(rt.singlePriceEA),
              double: Number(rt.doublePriceEA),
            },
            international: {
              single: Number(rt.singlePriceIntl),
              double: Number(rt.doublePriceIntl),
            },
          },
          capacity: rt.maxOccupancy,
          bedType: rt.bedType,
          size: rt.size,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get room types error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}