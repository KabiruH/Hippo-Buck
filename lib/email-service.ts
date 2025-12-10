// lib/email-service.ts
import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface PaymentConfirmationParams {
  to: string;
  bookingNumber: string;
  guestName: string;
  amount: number;
  receiptNumber: string;
  checkInDate: string;
  checkOutDate: string;
}

interface BookingConfirmationParams {
  to: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  numberOfRooms: number;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  paymentMethod?: string;
  specialRequests?: string;
  status: string;
}

// Send booking confirmation to guest (when booking is created)
export async function sendBookingConfirmationToGuest(params: BookingConfirmationParams) {
  try {
    const isPending = params.status === 'PENDING';
    const paymentInstructions = params.paymentMethod === 'CASH' 
      ? '<p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;"><strong>Payment:</strong> You can pay with cash when you arrive at the hotel.</p>'
      : isPending
      ? '<p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;"><strong>Payment Pending:</strong> Please complete payment to confirm your booking.</p>'
      : '<p style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;"><strong>Payment Confirmed!</strong> Your booking is confirmed.</p>';

    await transporter.sendMail({
      from: `"Hotel Hippo Buck" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: `Booking Confirmation - ${params.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Hotel Hippo Buck</h1>
            <p style="color: #6b7280; margin: 5px 0;">Homa Bay Town, Kenya</p>
          </div>

          <!-- Success Message -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0;">Booking Created Successfully! ✅</h2>
            <p style="margin: 0; font-size: 18px;">Reference: <strong>${params.bookingNumber}</strong></p>
          </div>

          ${paymentInstructions}

          <!-- Booking Details -->
          <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Booking Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Booking Reference:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${params.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: ${params.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7'}; color: ${params.status === 'CONFIRMED' ? '#065f46' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${params.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Room Type:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${params.roomType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Number of Rooms:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${params.numberOfRooms}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Guests:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${params.numberOfGuests}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Check-in:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${new Date(params.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Check-out:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${new Date(params.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Number of Nights:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${params.nights}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Total Amount:</td>
                <td style="padding: 12px 0 8px 0; color: #2563eb; font-size: 18px; font-weight: 700; text-align: right;">KES ${params.totalAmount.toLocaleString()}</td>
              </tr>
            </table>

            ${params.specialRequests ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">Special Requests:</p>
                <p style="color: #1f2937; margin: 0; font-style: italic;">${params.specialRequests}</p>
              </div>
            ` : ''}
          </div>

          <!-- Guest Information -->
          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Guest Information</h3>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Name:</strong> ${params.guestName}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> ${params.guestEmail}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Phone:</strong> ${params.guestPhone}</p>
          </div>

          <!-- Important Information -->
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #991b1b; margin: 0 0 10px 0;">Important Information</h4>
            <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
              <li style="margin: 5px 0;">Check-in time: 2:00 PM</li>
              <li style="margin: 5px 0;">Check-out time: 11:00 AM</li>
              <li style="margin: 5px 0;">Please bring a valid ID for check-in</li>
              ${params.paymentMethod === 'CASH' ? '<li style="margin: 5px 0;">Payment can be made at the hotel reception</li>' : ''}
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="text-align: center; padding: 20px 0; border-top: 2px solid #e5e7eb; margin-top: 30px;">
            <p style="color: #6b7280; margin: 5px 0;">Need help? Contact us:</p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Email:</strong> info@hotelhippobuck.com</p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Phone:</strong> +254 XXX XXX XXX</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;">Hotel Hippo Buck, Homa Bay Town, Kenya</p>
            <p style="margin: 5px 0;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Booking confirmation email sent to guest:', params.to);
  } catch (error) {
    console.error('❌ Error sending booking confirmation email to guest:', error);
  }
}

// Send booking notification to organization
export async function sendBookingNotificationToOrganization(params: BookingConfirmationParams) {
  try {
    await transporter.sendMail({
      from: `"Booking System" <${process.env.SMTP_USER}>`,
      to: process.env.ORGANIZATION_EMAIL || 'info@hotelhippobuck.com',
      subject: `🏨 New Booking - ${params.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Booking Received</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Information</h3>
            <p><strong>Booking Number:</strong> ${params.bookingNumber}</p>
            <p><strong>Status:</strong> <span style="background: ${params.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7'}; color: ${params.status === 'CONFIRMED' ? '#065f46' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${params.status}</span></p>
            <p><strong>Payment Method:</strong> ${params.paymentMethod || 'Not selected'}</p>
            <p><strong>Total Amount:</strong> KES ${params.totalAmount.toLocaleString()}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Guest Details</h3>
            <p><strong>Name:</strong> ${params.guestName}</p>
            <p><strong>Email:</strong> ${params.guestEmail}</p>
            <p><strong>Phone:</strong> ${params.guestPhone}</p>
          </div>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Stay Details</h3>
            <p><strong>Room Type:</strong> ${params.roomType}</p>
            <p><strong>Number of Rooms:</strong> ${params.numberOfRooms}</p>
            <p><strong>Guests:</strong> ${params.numberOfGuests}</p>
            <p><strong>Check-in:</strong> ${new Date(params.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Check-out:</strong> ${new Date(params.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Nights:</strong> ${params.nights}</p>
          </div>

          ${params.specialRequests ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: #92400e;">Special Requests:</p>
              <p style="margin: 5px 0 0 0; color: #78350f;">${params.specialRequests}</p>
            </div>
          ` : ''}

          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log('✅ Booking notification email sent to organization');
  } catch (error) {
    console.error('❌ Error sending booking notification to organization:', error);
  }
}

// Send payment confirmation to guest (when payment is received)
export async function sendPaymentConfirmationToGuest(params: PaymentConfirmationParams) {
  try {
    await transporter.sendMail({
      from: `"Hotel Hippo Buck" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: `Payment Confirmed - Booking ${params.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Received! ✅</h2>
          
          <p>Dear ${params.guestName},</p>
          
          <p>We have successfully received your payment of <strong>KES ${params.amount.toLocaleString()}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Booking Reference:</strong> ${params.bookingNumber}</p>
            <p><strong>M-Pesa Receipt:</strong> ${params.receiptNumber}</p>
            <p><strong>Amount Paid:</strong> KES ${params.amount.toLocaleString()}</p>
            <p><strong>Check-in:</strong> ${new Date(params.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(params.checkOutDate).toLocaleDateString()}</p>
          </div>
          
          <p>Your booking is now <strong style="color: #059669;">CONFIRMED</strong>!</p>
          
          <p>We look forward to welcoming you at Hotel Hippo Buck.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact us at info@hotelhippobuck.com
          </p>
        </div>
      `,
    });

    console.log('✅ Payment confirmation email sent to guest:', params.to);
  } catch (error) {
    console.error('❌ Error sending payment confirmation email to guest:', error);
  }
}

// Send payment notification to organization
export async function sendPaymentNotificationToOrganization(params: PaymentConfirmationParams) {
  try {
    await transporter.sendMail({
      from: `"Booking System" <${process.env.SMTP_USER}>`,
      to: process.env.ORGANIZATION_EMAIL || 'info@hotelhippobuck.com',
      subject: `💰 New Payment Received - ${params.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Payment Received</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Guest:</strong> ${params.guestName}</p>
            <p><strong>Booking Number:</strong> ${params.bookingNumber}</p>
            <p><strong>Amount:</strong> KES ${params.amount.toLocaleString()}</p>
            <p><strong>M-Pesa Receipt:</strong> ${params.receiptNumber}</p>
            <p><strong>Payment Method:</strong> M-Pesa</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Stay Details</h3>
            <p><strong>Check-in:</strong> ${new Date(params.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(params.checkOutDate).toLocaleDateString()}</p>
          </div>
          
          <p style="margin-top: 20px;">Booking status has been updated to <strong>CONFIRMED</strong>.</p>
        </div>
      `,
    });

    console.log('✅ Payment notification email sent to organization');
  } catch (error) {
    console.error('❌ Error sending payment notification to organization:', error);
  }
}