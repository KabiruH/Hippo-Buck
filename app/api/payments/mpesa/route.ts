// app/api/payments/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';
import { PaymentStatus, PaymentMethod, BookingStatus } from '@/lib/constant';
import { mpesaService } from '@/lib/mpesa'; 
import { 
  sendPaymentConfirmationToGuest, 
  sendPaymentNotificationToHotel 
} from '@/lib/email-service';


// Initiate M-Pesa STK Push
export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - guests can make payments too
    const authResult = await authenticateUser(request);
    const user = authResult.user;

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
    const phoneRegex = /^(254|0|\+254)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-]/g, ''))) {
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
          error: `Payment amount (KES ${amount}) exceeds remaining balance (KES ${remainingBalance})`,
          remainingBalance,
        },
        { status: 400 }
      );
    }

    // Format phone number using the service
    const formattedPhone = mpesaService.formatPhoneNumber(phoneNumber);

    // 🎯 Use the mpesaService to initiate STK Push
    const mpesaResponse = await mpesaService.stkPush({
      phoneNumber: formattedPhone,
      amount: Number(amount),
      accountReference: booking.bookingNumber,
      transactionDesc: `Payment for booking ${booking.bookingNumber}`,
    });


    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: Number(amount),
        paymentMethod: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
        transactionId: mpesaResponse.CheckoutRequestID, // Store CheckoutRequestID
        notes: `M-Pesa STK Push initiated for ${formattedPhone}. MerchantRequestID: ${mpesaResponse.MerchantRequestID}`,
      },
    });

    // Log activity
    if (user) {
      await prisma.activityLog.create({
        data: {
          userId: user.userId,
          action: 'MPESA_INITIATED',
          entityType: 'Payment',
          entityId: payment.id,
          details: JSON.stringify({
            bookingNumber: booking.bookingNumber,
            amount,
            phoneNumber: formattedPhone,
            checkoutRequestId: mpesaResponse.CheckoutRequestID,
          }),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'M-Pesa payment initiated successfully',
        payment,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        instructions: 'Please check your phone and enter your M-Pesa PIN to complete the payment',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('M-Pesa initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate M-Pesa payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// M-Pesa callback endpoint
export async function PUT(request: NextRequest) {
  try {
    // This endpoint will be called by M-Pesa with payment results
    const body = await request.json();

    // Parse M-Pesa callback
    const { Body } = body;
    const { stkCallback } = Body;
    
    if (!stkCallback) {
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Invalid callback data' 
      });
    }

    const { 
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode, 
      ResultDesc,
      CallbackMetadata 
    } = stkCallback;

    // Extract transaction details
    let mpesaReceiptNumber = '';
    let amount = 0;
    let phoneNumber = '';
    let transactionDate = '';

    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item: any) => {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = item.Value;
        }
        if (item.Name === 'Amount') {
          amount = Number(item.Value);
        }
        if (item.Name === 'PhoneNumber') {
          phoneNumber = item.Value;
        }
        if (item.Name === 'TransactionDate') {
          transactionDate = item.Value;
        }
      });
    }

    // Find the payment by CheckoutRequestID
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: CheckoutRequestID,
        status: PaymentStatus.PENDING,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Payment not found' 
      });
    }

    if (ResultCode === 0) {
      // Payment successful ✅
      
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: mpesaReceiptNumber, // Update with actual M-Pesa receipt number
          processedAt: new Date(),
          notes: `M-Pesa payment completed. Receipt: ${mpesaReceiptNumber}, Phone: ${phoneNumber}`,
        },
      });

      // Update booking
      const newPaidAmount = Number(payment.booking.paidAmount) + amount;
      const totalAmount = Number(payment.booking.totalAmount);
      const newStatus = newPaidAmount >= totalAmount
        ? BookingStatus.CONFIRMED
        : payment.booking.status;

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentMethod: PaymentMethod.MPESA,
        },
      });

      // 🎉 Send email notifications
      const emailParams = {
        to: payment.booking.guestEmail,
        bookingNumber: payment.booking.bookingNumber,
        guestName: `${payment.booking.guestFirstName} ${payment.booking.guestLastName}`,
        amount: amount,
        receiptNumber: mpesaReceiptNumber,
        checkInDate: payment.booking.checkInDate.toISOString(),
        checkOutDate: payment.booking.checkOutDate.toISOString(),
      };

      // Send to guest
      await sendPaymentConfirmationToGuest(emailParams);
      
      // Send to organization
      await sendPaymentNotificationToHotel(emailParams);

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: 'MPESA_COMPLETED',
          entityType: 'Payment',
          entityId: payment.id,
          details: JSON.stringify({
            mpesaReceiptNumber,
            amount,
            phoneNumber,
            transactionDate,
            bookingNumber: payment.booking.bookingNumber,
            newStatus,
            emailsSent: true,
          }),
        },
      });

    } else {
      // Payment failed ❌
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          notes: `M-Pesa payment failed: ${ResultDesc} (Code: ${ResultCode})`,
        },
      });
    }

    // Acknowledge receipt to M-Pesa
    return NextResponse.json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ 
      ResultCode: 1, 
      ResultDesc: 'Internal server error' 
    });
  }
}