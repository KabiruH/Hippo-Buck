'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { BookingStats } from '@/components/bookings/BookingStats';
import { BookingFilters } from '@/components/bookings/BookingFilters';
import { BookingCard } from '@/components/bookings/BookingCard';
import { CreateBookingDialog } from '@/components/bookings/CreateBookingDialog';
import { Pagination } from '@/components/bookings/Pagination';

interface Booking {
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
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/bookings';
      const params = new URLSearchParams();

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to load bookings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    await fetchBookings();
  };

  const handleCancel = async (bookingId: string, bookingNumber: string) => {
    if (!confirm(`Cancel booking ${bookingNumber}? This action cannot be undone.`)) return;

    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setAlert({
        type: 'success',
        message: `Booking ${bookingNumber} has been cancelled.`,
      });
      fetchBookings();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to cancel booking',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter bookings by search query
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.bookingNumber.toLowerCase().includes(searchLower) ||
      `${booking.guestFirstName} ${booking.guestLastName}`.toLowerCase().includes(searchLower) ||
      booking.guestEmail.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of bookings list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
    pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
    cancelledBookings: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="text-amber-600">Bookings</span> Management
            </h1>
            <p className="text-gray-600">View and manage all hotel bookings</p>
          </div>

          <CreateBookingDialog
            onBookingCreated={fetchBookings}
            onError={(message) => setAlert({ type: 'error', message })}
            onSuccess={(message) => setAlert({ type: 'success', message })}
          />
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            variant={alert.type === 'error' ? 'destructive' : 'default'}
            className={`mb-6 ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <BookingStats {...stats} />

        {/* Filters */}
        <BookingFilters
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          onStatusChange={setFilterStatus}
          onSearchChange={setSearchQuery}
        />

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'No bookings match your search criteria.'
                : 'No bookings match your current filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  isLoading={actionLoading === booking.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}