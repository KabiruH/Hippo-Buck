'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, Users, DoorOpen, CreditCard, Smartphone, Banknote, AlertCircle } from 'lucide-react';

interface BookingData {
  bookingId: string;
  bookingNumber: string;
  room: string;
  region: string;
  bedType: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: number;
  totalGuests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  status: string;
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('id');

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Load booking data from sessionStorage
    const storedData = sessionStorage.getItem('bookingConfirmation');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    } else if (bookingId) {
      // If no session data, fetch from API
      fetchBookingDetails(bookingId);
    } else {
      // No data available, redirect to booking page
      router.push('/booking');
    }
  }, [bookingId, router]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/bookings/${id}`, {
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      // Transform API data to match BookingData interface
      // You may need to adjust this based on your actual API response
      const transformedData: BookingData = {
        bookingId: data.booking.id,
        bookingNumber: data.booking.bookingNumber,
        room: data.booking.rooms[0]?.room.roomType.name || 'N/A',
        region: 'eastAfrican', // You may need to store this
        bedType: 'single', // You may need to store this
        checkIn: data.booking.checkInDate,
        checkOut: data.booking.checkOutDate,
        numberOfRooms: data.booking.rooms.length,
        totalGuests: data.booking.numberOfAdults + data.booking.numberOfChildren,
        nights: Math.ceil((new Date(data.booking.checkOutDate).getTime() - new Date(data.booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
        pricePerNight: 0, // Calculate from totalAmount / nights if needed
        totalPrice: Number(data.booking.totalAmount),
        currency: 'KES',
        guest: {
          firstName: data.booking.guestFirstName,
          lastName: data.booking.guestLastName,
          email: data.booking.guestEmail,
          phone: data.booking.guestPhone,
        },
        specialRequests: data.booking.specialRequests,
        status: data.booking.status,
      };
      setBookingData(transformedData);
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load booking details');
      router.push('/booking');
    }
  };

 const handlePayment = async () => {
  if (!selectedPaymentMethod || !bookingData) {
    alert('Please select a payment method');
    return;
  }

  setIsProcessingPayment(true);

  try {
    if (selectedPaymentMethod === 'MPESA') {
      // Initiate M-Pesa payment
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payments/mpesa', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          bookingId: bookingData.bookingId,
          amount: Number(bookingData.totalPrice),
          phoneNumber: bookingData.guest.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert(data.message + '\n' + (data.instructions || ''));
      sessionStorage.removeItem('bookingConfirmation');
      router.push(`/booking-status?id=${bookingData.bookingId}`);
      
    } else if (selectedPaymentMethod === 'CASH') {
      // For CASH - just record the payment method, keep booking PENDING
      const response = await fetch(`/api/bookings/${bookingData.bookingId}/payment-method`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'CASH',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      alert(
        '✅ Booking Confirmed!\n\n' +
        'You can pay with cash when you arrive at the hotel.\n\n' +
        'Booking Reference: ' + bookingData.bookingNumber + '\n' +
        'Check-in: ' + new Date(bookingData.checkIn).toLocaleDateString() + '\n\n' +
        'A confirmation email has been sent to ' + bookingData.guest.email
      );
      sessionStorage.removeItem('bookingConfirmation');
      router.push(`/booking-status?id=${bookingData.bookingId}`);
      
    } else if (selectedPaymentMethod === 'CARD') {
      // For CARD - process payment immediately and confirm booking
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          bookingId: bookingData.bookingId,
          amount: Number(bookingData.totalPrice),
          paymentMethod: 'CARD',
          transactionId: `CARD-${Date.now()}`,
          notes: `Card payment at booking confirmation`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert(
        '✅ Payment Successful!\n\n' +
        'Your booking is now CONFIRMED.\n\n' +
        'Booking Reference: ' + bookingData.bookingNumber + '\n' +
        'Amount Paid: ' + currencySymbol + bookingData.totalPrice.toLocaleString() + '\n\n' +
        'A confirmation email has been sent to ' + bookingData.guest.email
      );
      sessionStorage.removeItem('bookingConfirmation');
      router.push(`/booking-status?id=${bookingData.bookingId}`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('❌ Error: ' + (error instanceof Error ? error.message : 'Payment failed. Please try again.'));
  } finally {
    setIsProcessingPayment(false);
  }
};

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const currencySymbol = bookingData.currency === 'KES' ? 'KES ' : '$';
  const isPending = bookingData.status === 'PENDING';

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        <div className="bg-linear-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 rounded-full p-2 shrink-0">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Created Successfully!
              </h1>
              <p className="text-green-800 mb-2">
                Booking Reference: <span className="font-bold text-blue-600">{bookingData.bookingNumber}</span>
              </p>
              <p className="text-green-700 text-sm">
                A confirmation email has been sent to {bookingData.guest.email}
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-medium mb-1">Payment Required to Confirm Booking</p>
              <p className="text-amber-800 text-sm">
                Your booking is currently PENDING. Please complete payment below to confirm your reservation.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900 font-medium">
                    {bookingData.guest.firstName} {bookingData.guest.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{bookingData.guest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{bookingData.guest.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Details */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Reservation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DoorOpen className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Room Type</p>
                    <p className="text-gray-900 font-medium">{bookingData.room}</p>
                    <p className="text-blue-600 text-sm">
                      {bookingData.bedType === 'single' ? 'Single' : 'Double'} Bed & Breakfast
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Check-in</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(bookingData.checkIn).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Check-out</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(bookingData.checkOut).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 flex justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Guests & Rooms</p>
                      <p className="text-gray-900 font-medium">
                        {bookingData.totalGuests} {bookingData.totalGuests === 1 ? 'Guest' : 'Guests'} · {bookingData.numberOfRooms} {bookingData.numberOfRooms === 1 ? 'Room' : 'Rooms'} · {bookingData.nights} {bookingData.nights === 1 ? 'Night' : 'Nights'}
                      </p>
                    </div>
                  </div>
                </div>

                {bookingData.specialRequests && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Special Requests:</p>
                    <p className="text-gray-900 text-sm">{bookingData.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Options */}
            {isPending && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* M-Pesa */}
                  <button
                    onClick={() => setSelectedPaymentMethod('MPESA')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === 'MPESA'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <div className="text-left flex-1">
                        <p className="text-gray-900 font-medium">M-Pesa</p>
                        <p className="text-gray-600 text-sm">Pay via mobile money</p>
                      </div>
                      {selectedPaymentMethod === 'MPESA' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>

                  {/* Cash */}

                  <button
                    onClick={() => setSelectedPaymentMethod('CASH')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === 'CASH'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="w-6 h-6 text-blue-600" />
                      <div className="text-left flex-1">
                        <p className="text-gray-900 font-medium">Cash (Pay Later)</p>
                        <p className="text-gray-600 text-sm">Pay when you arrive at the hotel</p>
                      </div>
                      {selectedPaymentMethod === 'CASH' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => setSelectedPaymentMethod('CARD')}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === 'CARD'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      <div className="text-left flex-1">
                        <p className="text-gray-900 font-medium">Credit/Debit Card</p>
                        <p className="text-gray-600 text-sm">Pay with card</p>
                      </div>
                      {selectedPaymentMethod === 'CARD' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>

                  <Button
                    onClick={handlePayment}
                    disabled={!selectedPaymentMethod || isProcessingPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    size="lg"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : selectedPaymentMethod === 'CASH' ? (
                      'Confirm Booking (Pay Later)'
                    ) : selectedPaymentMethod === 'MPESA' ? (
                      `Pay ${currencySymbol}${bookingData.totalPrice.toLocaleString()} via M-Pesa`
                    ) : (
                      `Pay ${currencySymbol}${bookingData.totalPrice.toLocaleString()} with Card`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Price Summary */}
          <div className="md:col-span-1">
            <Card className="bg-white border-blue-500/30 sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {bookingData.numberOfRooms} × {bookingData.nights} nights
                  </span>
                  <span className="text-gray-900">
                    {currencySymbol}{bookingData.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">
                      {currencySymbol}{bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 pt-2">
                  *Taxes and breakfast included
                </p>

                {/* Status Badge */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${isPending
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {bookingData.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Skip Payment Option */}
        {isPending && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Not ready to pay now? You can pay later at the hotel.
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-gray-300 text-blue-600 hover:bg-gray-100"
            >
              I'll Pay Later
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}