import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { BookingStatus, RoomStatus } from '@/lib/constant';

// ✅ ADD THESE - Required for Next.js 15+
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    // Check if user is admin
    if (user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // ✅ FIX: Date ranges - create fresh Date objects for each calculation
    // (Next.js 15 is stricter about Date mutations)
    const now = new Date();
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // 1. BOOKING STATISTICS
    const [
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      activeBookings,
      upcomingCheckIns,
      upcomingCheckOuts,
      pendingBookings,
      cancelledBookings,
    ] = await Promise.all([
      // Total all-time bookings
      prisma.booking.count(),
      
      // Today's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      
      // This week's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: weekStart,
          },
        },
      }),
      
      // This month's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      }),
      
      // Currently checked-in guests
      prisma.booking.count({
        where: {
          status: BookingStatus.CHECKED_IN,
        },
      }),
      
      // Today's check-ins
      prisma.booking.count({
        where: {
          checkInDate: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
          },
        },
      }),
      
      // Today's check-outs
      prisma.booking.count({
        where: {
          checkOutDate: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: BookingStatus.CHECKED_IN,
        },
      }),
      
      // Pending bookings
      prisma.booking.count({
        where: {
          status: BookingStatus.PENDING,
        },
      }),
      
      // Cancelled bookings
      prisma.booking.count({
        where: {
          status: BookingStatus.CANCELLED,
        },
      }),
    ]);

    // 2. REVENUE STATISTICS
    const [todayRevenue, weekRevenue, monthRevenue, totalRevenue] = await Promise.all([
      // Today's revenue
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // This week's revenue
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: weekStart,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // This month's revenue
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: monthStart,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Total revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // 3. ROOM STATISTICS
    const [totalRooms, roomsByStatus] = await Promise.all([
      prisma.room.count(),
      
      prisma.room.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Format room status data
    const roomStatus = {
      available: roomsByStatus.find((r) => r.status === RoomStatus.AVAILABLE)?._count || 0,
      occupied: roomsByStatus.find((r) => r.status === RoomStatus.OCCUPIED)?._count || 0,
      reserved: roomsByStatus.find((r) => r.status === RoomStatus.RESERVED)?._count || 0,
      cleaning: roomsByStatus.find((r) => r.status === RoomStatus.CLEANING)?._count || 0,
      maintenance: roomsByStatus.find((r) => r.status === RoomStatus.MAINTENANCE)?._count || 0,
    };

    // Calculate occupancy rate
    const occupiedAndReserved = roomStatus.occupied + roomStatus.reserved;
    const occupancyRate = totalRooms > 0 ? ((occupiedAndReserved / totalRooms) * 100).toFixed(2) : '0.00';

    // 4. PAYMENT METHOD BREAKDOWN (This month)
    const paymentMethodBreakdown = await prisma.payment.groupBy({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: 'COMPLETED',
      },
      by: ['paymentMethod'],
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 5. RECENT BOOKINGS (Last 5)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
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

    // 6. OUTSTANDING PAYMENTS
    const outstandingPayments = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
        },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
      },
    });

    const totalOutstanding = outstandingPayments.reduce((sum, booking) => {
      const balance = Number(booking.totalAmount) - Number(booking.paidAmount);
      return sum + (balance > 0 ? balance : 0);
    }, 0);

    // 7. TOP CUSTOMERS (This month)
    const topCustomers = await prisma.booking.groupBy({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
      by: ['guestEmail', 'guestFirstName', 'guestLastName'],
      _sum: {
        totalAmount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    // 8. ROOM TYPE POPULARITY (This month)
    const roomTypePopularity = await prisma.bookingRoom.groupBy({
      where: {
        booking: {
          createdAt: {
            gte: monthStart,
          },
        },
      },
      by: ['roomId'],
      _count: true,
    });

    // Get room type details for popularity
    const popularRoomTypes = await prisma.room.findMany({
      where: {
        id: {
          in: roomTypePopularity.map((r) => r.roomId),
        },
      },
      include: {
        roomType: true,
      },
    });

    const roomTypeStats = popularRoomTypes.reduce((acc: any, room) => {
      const typeName = room.roomType.name;
      if (!acc[typeName]) {
        acc[typeName] = 0;
      }
      const count = roomTypePopularity.find((r) => r.roomId === room.id)?._count || 0;
      acc[typeName] += count;
      return acc;
    }, {});

    // Compile response
    return NextResponse.json(
      {
        bookings: {
          total: totalBookings,
          today: todayBookings,
          thisWeek: weekBookings,
          thisMonth: monthBookings,
          active: activeBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          upcomingCheckIns,
          upcomingCheckOuts,
        },
        revenue: {
          total: Number(totalRevenue._sum.amount || 0),
          today: Number(todayRevenue._sum.amount || 0),
          thisWeek: Number(weekRevenue._sum.amount || 0),
          thisMonth: Number(monthRevenue._sum.amount || 0),
          outstanding: totalOutstanding,
        },
        rooms: {
          total: totalRooms,
          occupancyRate: parseFloat(occupancyRate),
          status: roomStatus,
        },
        paymentMethods: paymentMethodBreakdown.map((pm) => ({
          method: pm.paymentMethod,
          amount: Number(pm._sum.amount || 0),
          count: pm._count,
        })),
        recentBookings: recentBookings.map((booking) => ({
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          totalAmount: Number(booking.totalAmount),
          status: booking.status,
          rooms: booking.rooms.map((br) => ({
            roomNumber: br.room.roomNumber,
            roomType: br.room.roomType.name,
          })),
          createdAt: booking.createdAt,
        })),
        topCustomers: topCustomers.map((customer) => ({
          name: `${customer.guestFirstName} ${customer.guestLastName}`,
          email: customer.guestEmail,
          totalSpent: Number(customer._sum.totalAmount || 0),
          bookingCount: customer._count,
        })),
        popularRoomTypes: Object.entries(roomTypeStats)
          .map(([name, count]) => ({ name, bookings: count }))
          .sort((a: any, b: any) => b.bookings - a.bookings)
          .slice(0, 5),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    
    // ✅ ADD: Better error logging for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        // Only show details in development
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}