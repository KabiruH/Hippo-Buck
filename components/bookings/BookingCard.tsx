// app/admin/bookings/components/BookingCard.tsx
import {
  Calendar,
  Users,
  Mail,
  Phone,
  DoorOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface BookingCardProps {
  booking: Booking;
  onApprove: (bookingId: string, bookingNumber: string) => void;
  onCancel: (bookingId: string, bookingNumber: string) => void;
  isLoading: boolean;
}

export function BookingCard({ booking, onApprove, onCancel, isLoading }: BookingCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: Clock,
          label: 'Pending',
        };
      case 'CONFIRMED':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          label: 'Confirmed',
        };
      case 'CHECKED_IN':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: CheckCircle,
          label: 'Checked In',
        };
      case 'CHECKED_OUT':
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: CheckCircle,
          label: 'Checked Out',
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircle,
          label: 'Cancelled',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: AlertCircle,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const guestName = `${booking.guestFirstName} ${booking.guestLastName}`;
  const remainingBalance = Number(booking.totalAmount) - Number(booking.paidAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

return (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
    {/* Header */}
    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900">{booking.bookingNumber}</h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>
        <p className="text-sm text-gray-700">
          Booked on {formatDate(booking.createdAt)}
        </p>
      </div>

      {/* Action Buttons */}
      {booking.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button
            onClick={() => onApprove(booking.id, booking.bookingNumber)}
            disabled={isLoading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            onClick={() => onCancel(booking.id, booking.bookingNumber)}
            disabled={isLoading}
            size="sm"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
      {booking.status === 'CONFIRMED' && (
        <Button
          onClick={() => onCancel(booking.id, booking.bookingNumber)}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Cancel Booking
        </Button>
      )}
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Guest Information */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
          Guest Information
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{guestName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>{booking.guestEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>{booking.guestPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Users className="w-4 h-4 text-blue-600" />
            <span>
              {booking.numberOfAdults} Adult{booking.numberOfAdults !== 1 ? 's' : ''}
              {booking.numberOfChildren > 0 &&
                `, ${booking.numberOfChildren} Child${booking.numberOfChildren !== 1 ? 'ren' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
          Stay Details
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-medium">Check-in:</span> {formatDate(booking.checkInDate)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-medium">Check-out:</span> {formatDate(booking.checkOutDate)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <DoorOpen className="w-4 h-4 text-blue-600" />
            <span>
              {booking.rooms.length} Room{booking.rooms.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Rooms */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">
        Room(s) Booked
      </h4>
      <div className="space-y-2">
        {booking.rooms.map((bookingRoom, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <DoorOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-900 font-medium">
                  Room {bookingRoom.room.roomNumber}
                </p>
                <p className="text-gray-700 text-sm">{bookingRoom.room.roomType.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-900 font-semibold">
                {formatCurrency(Number(bookingRoom.totalPrice))}
              </p>
              <p className="text-gray-600 text-xs">
                {formatCurrency(Number(bookingRoom.ratePerNight))} × {bookingRoom.numberOfNights} nights
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Payment Summary */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">Total Amount:</span>
        <span className="font-semibold text-gray-900">
          {formatCurrency(Number(booking.totalAmount))}
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">Amount Paid:</span>
        <span className="font-semibold text-green-600">
          {formatCurrency(Number(booking.paidAmount))}
        </span>
      </div>
      {remainingBalance > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-900">Balance Due:</span>
          <span className="font-bold text-blue-600 text-lg">
            {formatCurrency(remainingBalance)}
          </span>
        </div>
      )}
    </div>
  </div>
);
}