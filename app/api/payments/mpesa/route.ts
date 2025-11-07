// app/api/payments/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { PaymentStatus, PaymentMethod, BookingStatus } from '@/lib/constant';

// Initiate M-Pesa STK Push
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error) {
      return error;
    }

    const body = await request.json();
    const { bookingId, amount, phoneNumber } = body;

    // Validation
    if (!bookingId || !amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Booking ID, amount, and phone number are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (Kenyan)
    const phoneRegex = /^(254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use format: 254712345678 or 0712345678' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate remaining balance
    const totalAmount = Number(booking.totalAmount);
    const currentPaid = Number(booking.paidAmount);
    const remainingBalance = totalAmount - currentPaid;

    if (amount > remainingBalance) {
      return NextResponse.json(
        {
          error: `Payment amount exceeds remaining balance of KES ${remainingBalance}`,
          remainingBalance,
        },
        { status: 400 }
      );
    }

    // Format phone number (remove leading 0 if present, add 254)
    const formattedPhone = phoneNumber.startsWith('0')
      ? '254' + phoneNumber.substring(1)
      : phoneNumber;

    // TODO: Integrate with actual M-Pesa Daraja API
    // This is a placeholder - you'll need to add real M-Pesa integration
    
    /*
    Example M-Pesa STK Push implementation:
    
    const mpesaResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64'),
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.APP_URL}/api/payments/mpesa/callback`,
        AccountReference: booking.bookingNumber,
        TransactionDesc: `Payment for booking ${booking.bookingNumber}`,
      }),
    });
    */

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
        notes: `M-Pesa payment initiated for ${formattedPhone}`,
        // transactionId will be updated by callback
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'MPESA_INITIATED',
        entityType: 'Payment',
        entityId: payment.id,
        details: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          amount,
          phoneNumber: formattedPhone,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'M-Pesa payment initiated. Please check your phone for the payment prompt.',
        payment,
        instructions: 'Enter your M-Pesa PIN on your phone to complete the payment',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('M-Pesa initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// M-Pesa callback endpoint
export async function PUT(request: NextRequest) {
  try {
    // This endpoint will be called by M-Pesa with payment results
    const body = await request.json();

    // TODO: Verify callback is from M-Pesa (check IP whitelist, etc.)

    // Parse M-Pesa callback
    const { Body } = body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Extract transaction details
    let transactionId = '';
    let amount = 0;
    let phoneNumber = '';

    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item: any) => {
        if (item.Name === 'MpesaReceiptNumber') {
          transactionId = item.Value;
        }
        if (item.Name === 'Amount') {
          amount = item.Value;
        }
        if (item.Name === 'PhoneNumber') {
          phoneNumber = item.Value;
        }
      });
    }

    if (ResultCode === 0) {
      // Payment successful
      // Find the pending payment and update it
      const payment = await prisma.payment.findFirst({
        where: {
          paymentMethod: PaymentMethod.MPESA,
          status: PaymentStatus.PENDING,
          amount: amount,
        },
        include: {
          booking: true,
        },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            transactionId,
            processedAt: new Date(),
            notes: `M-Pesa payment completed. Receipt: ${transactionId}`,
          },
        });

        // Update booking
        const newPaidAmount = Number(payment.booking.paidAmount) + amount;
        const newStatus =
          newPaidAmount >= Number(payment.booking.totalAmount)
            ? BookingStatus.CONFIRMED
            : payment.booking.status;

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'MPESA_COMPLETED',
            entityType: 'Payment',
            entityId: payment.id,
            details: JSON.stringify({
              transactionId,
              amount,
              phoneNumber,
              bookingNumber: payment.booking.bookingNumber,
            }),
          },
        });
      }
    } else {
      // Payment failed
      const payment = await prisma.payment.findFirst({
        where: {
          paymentMethod: PaymentMethod.MPESA,
          status: PaymentStatus.PENDING,
          amount: amount,
        },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            notes: `M-Pesa payment failed: ${ResultDesc}`,
          },
        });
      }
    }

    // Acknowledge receipt to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
}