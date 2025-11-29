'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Calendar, Users, DoorOpen, Mail, Phone, CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface BookingDetails {
  id: string;
  bookingNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  specialRequests?: string;
  rooms: Array<{
    room: {
      roomNumber: string;
      roomType: {
        name: string;
      };
    };
    ratePerNight: number;
    numberOfNights: number;
    totalPrice: number;
  }>;
  payments: Array<{
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
}

export default function BookingLookupPage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'bookingNumber' | 'email'>('bookingNumber');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a booking number or email');
      return;
    }

    setIsSearching(true);
    setError(null);
    setBooking(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      let response;
      
      if (searchType === 'bookingNumber') {
        response = await fetch(
          `/api/bookings?bookingNumber=${encodeURIComponent(searchValue.trim())}`,
          {
            headers,
          }
        );
      } else {
        response = await fetch(
          `/api/bookings?email=${encodeURIComponent(searchValue.trim().toLowerCase())}`,
          {
            headers,
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find booking');
      }

      if (!data.bookings || data.bookings.length === 0) {
        setError(`No booking found with ${searchType === 'bookingNumber' ? 'booking number' : 'email'}: ${searchValue}`);
        return;
      }

      // If searching by email, use the first booking or let user select
      const foundBooking = data.bookings[0];
      setBooking(foundBooking);

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search booking');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
      CHECKED_IN: 'bg-blue-100 text-blue-800 border-blue-300',
      CHECKED_OUT: 'bg-gray-100 text-gray-800 border-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5" />;
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleMakePayment = () => {
    if (booking) {
      router.push(`/booking-confirmation?id=${booking.id}`);
    }
  };

  const remainingBalance = booking 
    ? Number(booking.totalAmount) - Number(booking.paidAmount)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/1.jpg"
            alt="Find Your Booking"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              Find Your <span className="text-blue-400">Booking</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Enter your booking number or email to view your reservation
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* Search Form */}
          <Card className="bg-white border-gray-200 mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 text-xl">Search Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Search Type Toggle */}
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    onClick={() => setSearchType('bookingNumber')}
                    variant={searchType === 'bookingNumber' ? 'default' : 'outline'}
                    className={
                      searchType === 'bookingNumber'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }
                  >
                    Booking Number
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSearchType('email')}
                    variant={searchType === 'email' ? 'default' : 'outline'}
                    className={
                      searchType === 'email'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }
                  >
                    Email Address
                  </Button>
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-gray-900">
                    {searchType === 'bookingNumber'
                      ? 'Enter Booking Number'
                      : 'Enter Email Address'}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="search"
                      type={searchType === 'email' ? 'email' : 'text'}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={
                        searchType === 'bookingNumber'
                          ? 'e.g., BK123456'
                          : 'e.g., guest@example.com'
                      }
                      className="pl-10 bg-gray-50 border-gray-300 text-gray-900"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Search Button */}
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Find Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Booking Details */}
          {booking && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-lg p-4 flex items-center gap-3 border ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusIcon(booking.status)}
                <div className="flex-1">
                  <p className="font-semibold">
                    Booking Status: {booking.status}
                  </p>
                  {booking.status === 'PENDING' && (
                    <p className="text-sm opacity-80 mt-1">
                      Payment required to confirm your booking
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center justify-between">
                    <span>Booking Details</span>
                    <span className="text-blue-600 text-lg font-mono">
                      {booking.bookingNumber}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guest Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">
                        Guest Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>
                            {booking.guestFirstName} {booking.guestLastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{booking.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{booking.guestPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">
                        Stay Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">Check-in</p>
                            <p>{formatDate(booking.checkInDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">Check-out</p>
                            <p>{formatDate(booking.checkOutDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {booking.numberOfAdults} Adults, {booking.numberOfChildren}{' '}
                            Children
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider mb-3">
                      Room(s) Booked
                    </h3>
                    <div className="space-y-2">
                      {booking.rooms.map((bookingRoom, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <DoorOpen className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-gray-900 font-medium">
                                Room {bookingRoom.room.roomNumber}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {bookingRoom.room.roomType.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-semibold">
                              {formatCurrency(Number(bookingRoom.totalPrice))}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {formatCurrency(Number(bookingRoom.ratePerNight))} ×{' '}
                              {bookingRoom.numberOfNights} nights
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider mb-2">
                        Special Requests
                      </h3>
                      <p className="text-gray-700 text-sm">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider mb-3">
                      Payment Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Total Amount:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(Number(booking.totalAmount))}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Amount Paid:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(Number(booking.paidAmount))}
                        </span>
                      </div>
                      {remainingBalance > 0 && (
                        <div className="flex justify-between text-gray-700 pt-2 border-t border-gray-200">
                          <span className="font-semibold">Balance Due:</span>
                          <span className="font-bold text-blue-600 text-lg">
                            {formatCurrency(remainingBalance)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment History */}
                  {booking.payments && booking.payments.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider mb-3">
                        Payment History
                      </h3>
                      <div className="space-y-2">
                        {booking.payments.map((payment, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded p-3 flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-gray-900">
                                  {payment.paymentMethod || 'N/A'}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {new Date(payment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(Number(payment.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Action */}
                  {booking.status === 'PENDING' && remainingBalance > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <Button
                        onClick={handleMakePayment}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Make Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}