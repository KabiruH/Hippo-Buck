// app/admin/bookings/components/BookingStats.tsx
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BookingStatsProps {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}

export function BookingStats({
  totalBookings,
  confirmedBookings,
  pendingBookings,
  cancelledBookings,
}: BookingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Bookings */}
      <Card className="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium mb-1">Total Bookings</p>
              <p className="text-4xl font-bold text-amber-900">{totalBookings}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Bookings */}
      <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium mb-1">Confirmed</p>
              <p className="text-4xl font-bold text-green-900">{confirmedBookings}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Bookings */}
      <Card className="bg-linear-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium mb-1">Pending</p>
              <p className="text-4xl font-bold text-orange-900">{pendingBookings}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancelled Bookings */}
      <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium mb-1">Cancelled</p>
              <p className="text-4xl font-bold text-red-900">{cancelledBookings}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}