// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { PaymentStatus, PaymentMethod, BookingStatus, isValidPaymentMethod, isValidPaymentStatus } from '@/lib/constant';

// Create a new payment
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const body = await request.json();
    const { bookingId, amount, paymentMethod, transactionId, notes } = body;

    // Validation
    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Booking ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (!isValidPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'Cannot add payment to cancelled booking' },
        { status: 400 }
      );
    }

    // Calculate current paid amount and remaining balance
    const totalAmount = Number(booking.totalAmount);
    const currentPaid = Number(booking.paidAmount);
    const remainingBalance = totalAmount - currentPaid;

    if (amount > remainingBalance) {
      return NextResponse.json(
        {
          error: `Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`,
          remainingBalance,
        },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod,
        transactionId: transactionId || null,
        status: PaymentStatus.COMPLETED,
        notes: notes || null,
        processedAt: new Date(),
      },
    });

    // Update booking paid amount
    const newPaidAmount = currentPaid + Number(amount);
    const newBookingStatus =
      newPaidAmount >= totalAmount
        ? BookingStatus.CONFIRMED
        : booking.status;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paidAmount: newPaidAmount,
        status: newBookingStatus,
        paymentMethod: paymentMethod, // Update to latest payment method
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'PAYMENT_RECEIVED',
        entityType: 'Payment',
        entityId: payment.id,
        details: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          amount,
          paymentMethod,
          transactionId,
          newPaidAmount,
          remainingBalance: totalAmount - newPaidAmount,
        }),
      },
    });

    // Get updated booking with all payments
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Payment recorded successfully',
        payment,
        booking: updatedBooking,
        remainingBalance: totalAmount - newPaidAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all payments (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            totalAmount: true,
            paidAmount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    return NextResponse.json(
      {
        payments,
        total: payments.length,
        totalAmount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}