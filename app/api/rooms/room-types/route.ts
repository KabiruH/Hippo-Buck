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
        basePrice: true,
        maxOccupancy: true,
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
          basePrice: Number(rt.basePrice),
          capacity: rt.maxOccupancy,
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