// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { RoomStatus } from '@/lib/constant';

// Get all rooms
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const roomTypeId = searchParams.get('roomTypeId');
    const floor = searchParams.get('floor');
    const includeCurrentBooking = searchParams.get('includeCurrentBooking') === 'true';

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    if (floor) {
      where.floor = parseInt(floor);
    }

    // Fetch rooms
    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomType: {
          include: {
            amenities: true,
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' },
      ],
    });

    // If includeCurrentBooking is true, fetch current booking for each room
    let roomsWithBookings = rooms;

    if (includeCurrentBooking) {
      const roomIds = rooms.map((r) => r.id);
      const today = new Date();

      // Find bookings where the room is currently occupied or reserved
      const currentBookings = await prisma.bookingRoom.findMany({
        where: {
          roomId: { in: roomIds },
          booking: {
            checkInDate: { lte: today },
            checkOutDate: { gt: today },
            status: {
              in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
            },
          },
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              guestFirstName: true,
              guestLastName: true,
              guestEmail: true,
              guestPhone: true,
              checkInDate: true,
              checkOutDate: true,
              status: true,
              numberOfAdults: true,
              numberOfChildren: true,
            },
          },
        },
      });

      // Map bookings to rooms
      roomsWithBookings = rooms.map((room) => {
        const currentBooking = currentBookings.find((b) => b.roomId === room.id);
        return {
          ...room,
          currentBooking: currentBooking ? currentBooking.booking : null,
        };
      });
    }

    // Format response
    const formattedRooms = roomsWithBookings.map((room: any) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: room.roomType.id,
        name: room.roomType.name,
        slug: room.roomType.slug,
        description: room.roomType.description,
pricing: {
  eastAfrican: {
    single: Number(room.roomType.singlePriceEA),
    double: Number(room.roomType.doublePriceEA),
  },
  international: {
    single: Number(room.roomType.singlePriceIntl),
    double: Number(room.roomType.doublePriceIntl),
  },
},
        maxOccupancy: room.roomType.maxOccupancy,
        bedType: room.roomType.bedType,
        size: room.roomType.size,
        amenities: room.roomType.amenities.map((a: any) => a.amenity),
        image: room.roomType.images[0]?.imageUrl || null,
      },
      currentBooking: room.currentBooking || null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));

    // Calculate statistics
    const stats = {
      total: rooms.length,
      available: rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length,
      occupied: rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length,
      reserved: rooms.filter((r) => r.status === RoomStatus.RESERVED).length,
      cleaning: rooms.filter((r) => r.status === RoomStatus.CLEANING).length,
      maintenance: rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length,
    };

    return NextResponse.json(
      {
        rooms: formattedRooms,
        stats,
        total: formattedRooms.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new room (POST function)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    // Check if user is ADMIN or MANAGER
    if (user!.role !== 'ADMIN' && user!.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins and managers can create rooms.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roomNumber, roomTypeId, floor, status, description } = body;

    // Validation
    if (!roomNumber || !roomTypeId) {
      return NextResponse.json(
        { error: 'Room number and room type are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(RoomStatus);
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findFirst({
      where: { roomNumber },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: `Room ${roomNumber} already exists` },
        { status: 400 }
      );
    }

    // Check if room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: 'Invalid room type' },
        { status: 400 }
      );
    }

    // Create the room
    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        roomTypeId,
        floor: floor || 1,
        status: status || RoomStatus.AVAILABLE,
        notes: description || null, // Changed from description to notes
      },
      include: {
        roomType: {
          include: {
            amenities: true,
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'ROOM_CREATED',
        entityType: 'Room',
        entityId: newRoom.id,
        details: JSON.stringify({
          roomNumber: newRoom.roomNumber,
          roomType: roomType.name,
          floor: newRoom.floor,
          status: newRoom.status,
        }),
      },
    });

    return NextResponse.json(
  {
    message: 'Room created successfully',
    room: {
      id: newRoom.id,
      roomNumber: newRoom.roomNumber,
      floor: newRoom.floor,
      status: newRoom.status,
      notes: newRoom.notes,
      roomType: {
        id: newRoom.roomType.id,
        name: newRoom.roomType.name,
        pricing: {
          eastAfrican: {
            single: Number(newRoom.roomType.singlePriceEA),  // ✅ Changed from room to newRoom
            double: Number(newRoom.roomType.doublePriceEA),  // ✅ Changed from room to newRoom
          },
          international: {
            single: Number(newRoom.roomType.singlePriceIntl),  // ✅ Changed from room to newRoom
            double: Number(newRoom.roomType.doublePriceIntl),  // ✅ Changed from room to newRoom
          },
        },
      },
    },
  },
  { status: 201 }
);
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update room status (for admin use)
export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const body = await request.json();
    const { roomId, status } = body;

    // Validation
    if (!roomId || !status) {
      return NextResponse.json(
        { error: 'Room ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(RoomStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomType: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Update room status
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status },
      include: {
        roomType: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'ROOM_STATUS_UPDATED',
        entityType: 'Room',
        entityId: roomId,
        details: JSON.stringify({
          roomNumber: room.roomNumber,
          oldStatus: room.status,
          newStatus: status,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Room status updated successfully',
        room: updatedRoom,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update room status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}