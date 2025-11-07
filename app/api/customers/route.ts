// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';

// Get all customers with their booking history
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const name = searchParams.get('name');

    // Build where clause for searching customers
    const where: any = {};

    if (email) {
      where.guestEmail = {
        contains: email.toLowerCase(),
      };
    }

    if (phone) {
      where.guestPhone = {
        contains: phone,
      };
    }

    if (name) {
      where.OR = [
        { guestFirstName: { contains: name } },
        { guestLastName: { contains: name } },
      ];
    }

    // Get all unique customers with their booking history
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingNumber: true,
        guestFirstName: true,
        guestLastName: true,
        guestEmail: true,
        guestPhone: true,
        guestCountry: true,
        checkInDate: true,
        checkOutDate: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group bookings by customer (using email as unique identifier)
    const customerMap = new Map();

    bookings.forEach((booking) => {
      const email = booking.guestEmail.toLowerCase();

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          guestFirstName: booking.guestFirstName,
          guestLastName: booking.guestLastName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          guestCountry: booking.guestCountry,
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalSpent: 0,
          lastVisit: null,
          firstVisit: null,
          bookings: [],
        });
      }

      const customer = customerMap.get(email);
      customer.totalBookings++;
      customer.totalSpent += Number(booking.totalAmount);

      if (booking.status === 'CHECKED_OUT') {
        customer.completedBookings++;
      }

      if (booking.status === 'CANCELLED') {
        customer.cancelledBookings++;
      }

      // Track first and last visit
      const checkInDate = new Date(booking.checkInDate);
      if (!customer.firstVisit || checkInDate < customer.firstVisit) {
        customer.firstVisit = checkInDate;
      }
      if (!customer.lastVisit || checkInDate > customer.lastVisit) {
        customer.lastVisit = checkInDate;
      }

      customer.bookings.push({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalAmount: booking.totalAmount,
        status: booking.status,
      });
    });

    // Convert map to array and calculate loyalty tiers
    const customers = Array.from(customerMap.values()).map((customer) => {
      // Determine loyalty tier based on total bookings
      let loyaltyTier = 'New';
      if (customer.completedBookings >= 10) {
        loyaltyTier = 'VIP';
      } else if (customer.completedBookings >= 5) {
        loyaltyTier = 'Gold';
      } else if (customer.completedBookings >= 2) {
        loyaltyTier = 'Silver';
      }

      return {
        ...customer,
        loyaltyTier,
        loyaltyPoints: customer.completedBookings * 100, // 100 points per completed booking
      };
    });

    // Sort by total spent (descending)
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(
      {
        customers,
        total: customers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}