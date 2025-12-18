'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoomStatusManager from '@/components/rooms/RoomStatusManager';

// Types
interface BookingStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  active: number;
  pending: number;
  cancelled: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
}

interface RevenueStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  outstanding: number;
}

interface RoomStats {
  total: number;
  occupancyRate: number;
  status: {
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    maintenance: number;
  };
}

interface PaymentMethod {
  method: string;
  amount: number;
  count: number;
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  rooms: Array<{
    roomNumber: string;
    roomType: string;
  }>;
  createdAt: string;
}

interface TopCustomer {
  name: string;
  email: string;
  totalSpent: number;
  bookingCount: number;
}

interface PopularRoomType {
  name: string;
  bookings: number;
}

interface DashboardData {
  bookings: BookingStats;
  revenue: RevenueStats;
  rooms: RoomStats;
  paymentMethods: PaymentMethod[];
  recentBookings: RecentBooking[];
  topCustomers: TopCustomer[];
  popularRoomTypes: PopularRoomType[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage if it exists
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include', // Include cookies/auth tokens
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login page
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CHECKED_IN: 'bg-blue-100 text-blue-800',
      CHECKED_OUT: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Hippo Buck Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(data.revenue.today)}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This Month: {formatCurrency(data.revenue.thisMonth)}
            </p>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Guests</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{data.bookings.active}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total Bookings: {data.bookings.thisMonth} this month
            </p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {data.rooms.occupancyRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.rooms.status.occupied + data.rooms.status.reserved} of {data.rooms.total} rooms
            </p>
          </div>

          {/* Today's Check-ins/Check-outs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activity</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      ↓ {data.bookings.upcomingCheckIns}
                    </p>
                    <p className="text-xs text-gray-500">Check-ins</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-orange-600">
                      ↑ {data.bookings.upcomingCheckOuts}
                    </p>
                    <p className="text-xs text-gray-500">Check-outs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {data.rooms.status.available}
                </p>
                <p className="text-sm text-gray-600 mt-1">Available</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{data.rooms.status.occupied}</p>
                <p className="text-sm text-gray-600 mt-1">Occupied</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{data.rooms.status.reserved}</p>
                <p className="text-sm text-gray-600 mt-1">Reserved</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">{data.rooms.status.cleaning}</p>
                <p className="text-sm text-gray-600 mt-1">Cleaning</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {data.rooms.status.maintenance}
                </p>
                <p className="text-sm text-gray-600 mt-1">Maintenance</p>
              </div>
            </div>
          </div>

          {/* Outstanding Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Payments</h2>
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-orange-600">
                {formatCurrency(data.revenue.outstanding)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Outstanding Balance</p>
              <p className="text-xs text-gray-500 mt-4">{data.bookings.pending} pending bookings</p>
            </div>
          </div>
        </div>

        {/* Payment Methods & Popular Room Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Methods (This Month)
            </h2>
            <div className="space-y-3">
              {data.paymentMethods.map((pm, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{pm.method || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{pm.count} transactions</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(pm.amount)}</p>
                </div>
              ))}
              {data.paymentMethods.length === 0 && (
                <p className="text-center text-gray-500 py-4">No payments this month</p>
              )}
            </div>
          </div>

          {/* Popular Room Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Room Types (This Month)
            </h2>
            <div className="space-y-3">
              {data.popularRoomTypes.map((roomType, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="font-medium text-gray-900">{roomType.name}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{roomType.bookings} bookings</p>
                </div>
              ))}
              {data.popularRoomTypes.length === 0 && (
                <p className="text-center text-gray-500 py-4">No bookings this month</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings & Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/bookings')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Booking
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Guest
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Dates
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <p className="text-sm font-medium text-gray-900">{booking.bookingNumber}</p>
                        <p className="text-xs text-gray-500">
                          {booking.rooms.map((r) => r.roomNumber).join(', ')}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">{booking.guestName}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">{formatDate(booking.checkIn)}</p>
                        <p className="text-xs text-gray-500">to {formatDate(booking.checkOut)}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentBookings.length === 0 && (
                <p className="text-center text-gray-500 py-8">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers (This Month)</h2>
            <div className="space-y-4">
              {data.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-600">{customer.bookingCount} bookings</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {data.topCustomers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No customers this month</p>
              )}
            </div>
          </div>
    {/* Room status Management */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
  <RoomStatusManager onStatusChange={fetchDashboardData} />
</div>
        </div>
      </div>
    </div>
  );
}