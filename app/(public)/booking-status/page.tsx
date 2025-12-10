// app/booking-status/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  DoorOpen, 
  Clock,
  Mail,
  Phone,
  MapPin,
  Download,
  Home,
  AlertCircle
} from 'lucide-react';

interface BookingData {
  id: string;
  bookingNumber: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  totalAmount: string;
  paidAmount: string;
  paymentMethod: string | null;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string | null;
  rooms: Array<{
    room: {
      roomNumber: string;
      roomType: {
        name: string;
        description: string;
      };
    };
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
}

function BookingStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    fetchBookingStatus();
  }, [bookingId]);

  const fetchBookingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'Unable to load booking details'}</p>
              <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  const totalGuests = booking.numberOfAdults + booking.numberOfChildren;
  const balance = Number(booking.totalAmount) - Number(booking.paidAmount);
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">
                Reference: <span className="font-mono font-bold text-blue-600">{booking.bookingNumber}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(booking.status)}`}>
              <span className="font-medium">{booking.status}</span>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-medium mb-1">Booking Pending</p>
              <p className="text-amber-800 text-sm">
                {booking.paymentMethod === 'CASH' 
                  ? 'You can pay with cash when you arrive at the hotel.'
                  : 'Complete payment to confirm your booking.'}
              </p>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-900 font-medium mb-1">Booking Confirmed!</p>
              <p className="text-green-800 text-sm">
                Your reservation is confirmed. We look forward to welcoming you!
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Details */}
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
                    {booking.guestFirstName} {booking.guestLastName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{booking.guestEmail}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phone:</span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{booking.guestPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Details */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Reservation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.rooms.map((room, index) => (
                  <div key={index} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                    <DoorOpen className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {room.room.roomType.name} - Room {room.room.roomNumber}
                      </p>
                      <p className="text-gray-600 text-sm">{room.room.roomType.description}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Check-in</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(booking.checkInDate).toLocaleDateString('en-US', {
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
                      {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
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
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Guests & Duration</p>
                    <p className="text-gray-900 font-medium">
                      {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'} · {booking.rooms.length} {booking.rooms.length === 1 ? 'Room' : 'Rooms'} · {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Special Requests:</p>
                    <p className="text-gray-900 text-sm">{booking.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {booking.payments.length > 0 && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <div>
                          <p className="text-gray-900 font-medium">KES {Number(payment.amount).toLocaleString()}</p>
                          <p className="text-gray-600 text-sm">{payment.paymentMethod} · {new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Price Summary */}
            <Card className="bg-white border-blue-500/30 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-gray-900">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-gray-900 font-medium">
                    KES {Number(booking.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600 font-medium">
                    KES {Number(booking.paidAmount).toLocaleString()}
                  </span>
                </div>
                {balance > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Balance:</span>
                    <span className="text-amber-600 font-bold">
                      KES {balance.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.paymentMethod && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">Payment Method:</p>
                    <p className="text-gray-900 font-medium">{booking.paymentMethod}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hotel Location */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Hotel Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium mb-1">Hotel Hippo Buck</p>
                <p className="text-gray-600 text-sm">Homa Bay Town</p>
                <p className="text-gray-600 text-sm">Homa Bay, Kenya</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-300 text-gray-900 hover:bg-gray-100"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Print Confirmation
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BookingStatusContent />
    </Suspense>
  );
}