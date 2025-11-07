// lib/booking-utils.ts

import { PrismaClient, Prisma, RoomType, Room, Booking, SeasonalPricing } from '@prisma/client';
import { BookingStatus, RoomStatus } from './constant'; 

type RoomWithTypeAndBookings = Room & {
  roomType: RoomType;
  bookings: Array<{
    booking: Booking;
  }>;
};

/**
 * Generate a unique booking number
 * Format: HHB-YYYYMMDD-XXXX
 * Example: HHB-20250104-A7B3
 */
export function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate random 4-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `HHB-${year}${month}${day}-${randomCode}`;
}

/**
 * Generate a shorter, more user-friendly confirmation code
 * Format: 6-digit alphanumeric (e.g., A7B3X9)
 */
export function generateConfirmationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Calculate number of nights between check-in and check-out
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format currency in KES
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if a date falls within a seasonal pricing period
 */
export async function getApplicablePricing(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  prisma: PrismaClient
): Promise<SeasonalPricing | null> {
  const seasonalPricing = await prisma.seasonalPricing.findFirst({
    where: {
      roomTypeId,
      isActive: true,
      OR: [
        {
          // Seasonal period overlaps with booking period
          startDate: { lte: checkOut },
          endDate: { gte: checkIn },
        },
      ],
    },
    orderBy: {
      priceMultiplier: 'desc', // Get highest applicable rate
    },
  });

  return seasonalPricing;
}

/**
 * Calculate total price for a room booking
 */
export async function calculateRoomPrice(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  prisma: PrismaClient
): Promise<{ pricePerNight: number; totalPrice: number; nights: number }> {
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
  });

  if (!roomType) {
    throw new Error('Room type not found');
  }

  const nights = calculateNights(checkIn, checkOut);
  let pricePerNight = Number(roomType.basePrice);

  // Check for seasonal pricing
  const seasonalPricing = await getApplicablePricing(
    roomTypeId,
    checkIn,
    checkOut,
    prisma
  );

  if (seasonalPricing) {
    if (seasonalPricing.fixedPrice) {
      pricePerNight = Number(seasonalPricing.fixedPrice);
    } else {
      pricePerNight = pricePerNight * seasonalPricing.priceMultiplier;
    }
  }

  const totalPrice = pricePerNight * nights;

  return {
    pricePerNight,
    totalPrice,
    nights,
  };
}

/**
 * Find available rooms for a given period
 */
export async function findAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  roomTypeId: string | undefined,
  prisma: PrismaClient
): Promise<RoomWithTypeAndBookings[]> {
  const whereClause: Prisma.RoomWhereInput = {
    isActive: true,
    status: { in: [RoomStatus.AVAILABLE, RoomStatus.RESERVED] }, // CHANGED: Use constants instead of strings
  };

  if (roomTypeId) {
    whereClause.roomTypeId = roomTypeId;
  }

  const rooms = await prisma.room.findMany({
    where: whereClause,
    include: {
      roomType: true,
      bookings: {
        where: {
          booking: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }, // CHANGED: Use constants instead of strings
            OR: [
              {
                // Existing booking overlaps with requested dates
                checkInDate: { lt: checkOut },
                checkOutDate: { gt: checkIn },
              },
            ],
          },
        },
        include: {
          booking: true,
        },
      },
    },
  });

  // Filter out rooms that have conflicting bookings
  const availableRooms = rooms.filter((room: RoomWithTypeAndBookings) => room.bookings.length === 0);

  return availableRooms;
}

/**
 * Validate booking dates
 */
export function validateBookingDates(checkIn: Date, checkOut: Date): {
  isValid: boolean;
  error?: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return {
      isValid: false,
      error: 'Check-in date cannot be in the past',
    };
  }

  if (checkOut <= checkIn) {
    return {
      isValid: false,
      error: 'Check-out date must be after check-in date',
    };
  }

  const maxStayDays = 30;
  const nights = calculateNights(checkIn, checkOut);
  
  if (nights > maxStayDays) {
    return {
      isValid: false,
      error: `Maximum stay is ${maxStayDays} nights`,
    };
  }

  return { isValid: true };
}

/**
 * Format booking status for display
 */
export function formatBookingStatus(status: string): {
  label: string;
  color: string;
} {
  // CHANGED: Use constants for type safety
  const statusMap: Record<string, { label: string; color: string }> = {
    [BookingStatus.PENDING]: { label: 'Pending', color: 'yellow' },
    [BookingStatus.CONFIRMED]: { label: 'Confirmed', color: 'green' },
    [BookingStatus.CHECKED_IN]: { label: 'Checked In', color: 'blue' },
    [BookingStatus.CHECKED_OUT]: { label: 'Checked Out', color: 'gray' },
    [BookingStatus.CANCELLED]: { label: 'Cancelled', color: 'red' },
    [BookingStatus.NO_SHOW]: { label: 'No Show', color: 'orange' },
  };

  return statusMap[status] || { label: status, color: 'gray' };
}

/**
 * Generate email content for booking confirmation
 */
export function generateBookingConfirmationEmail(booking: Booking & { 
  guestFirstName: string; 
  guestLastName: string; 
  numberOfAdults: number; 
  numberOfChildren: number; 
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Booking Confirmation - ${booking.bookingNumber} - Hotel Hippo Buck`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a5f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        .confirmation-code { font-size: 24px; font-weight: bold; color: #1e3a5f; text-align: center; padding: 20px; background-color: #e8f4f8; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hotel Hippo Buck</h1>
          <p>Your Lakeside Retreat in Homa Bay</p>
        </div>
        
        <div class="content">
          <h2>Booking Confirmed!</h2>
          <p>Dear ${booking.guestFirstName} ${booking.guestLastName},</p>
          <p>Thank you for choosing Hotel Hippo Buck. Your booking has been confirmed.</p>
          
          <div class="confirmation-code">
            Confirmation Code: ${booking.bookingNumber}
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Check-in Date:</strong></span>
              <span>${new Date(booking.checkInDate).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-out Date:</strong></span>
              <span>${new Date(booking.checkOutDate).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="detail-row">
              <span><strong>Number of Guests:</strong></span>
              <span>${booking.numberOfAdults} Adults${booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} Children` : ''}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Amount:</strong></span>
              <span>KES ${booking.totalAmount}</span>
            </div>
          </div>
          
          <h3>Important Information</h3>
          <ul>
            <li>Check-in time: 2:00 PM</li>
            <li>Check-out time: 11:00 AM</li>
            <li>Please present this confirmation code at reception</li>
            <li>Valid ID required at check-in</li>
          </ul>
          
          <p>If you need to modify or cancel your booking, please contact us:</p>
          <p>
            Phone: +254 700 000 000<br>
            Email: reservations@hotelhippobuck.com
          </p>
          
          <p>We look forward to welcoming you!</p>
        </div>
        
        <div class="footer">
          <p>Hotel Hippo Buck - Homa Bay Town, Lake Victoria</p>
          <p>Experience the magic of Lake Victoria</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Hotel Hippo Buck - Booking Confirmation
    
    Dear ${booking.guestFirstName} ${booking.guestLastName},
    
    Your booking has been confirmed!
    
    Confirmation Code: ${booking.bookingNumber}
    
    Booking Details:
    - Check-in: ${new Date(booking.checkInDate).toLocaleDateString('en-GB')}
    - Check-out: ${new Date(booking.checkOutDate).toLocaleDateString('en-GB')}
    - Guests: ${booking.numberOfAdults} Adults${booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} Children` : ''}
    - Total Amount: KES ${booking.totalAmount}
    
    Check-in time: 2:00 PM
    Check-out time: 11:00 AM
    
    Please present this confirmation code at reception.
    
    Contact us:
    Phone: +254 700 000 000
    Email: reservations@hotelhippobuck.com
    
    We look forward to welcoming you!
    
    Hotel Hippo Buck - Your Lakeside Retreat
  `;

  return { subject, html, text };
}