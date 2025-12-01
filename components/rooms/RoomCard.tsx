// app/admin/rooms/components/RoomCard.tsx
import {
  DoorOpen,
  Bed,
  Users,
  Wifi,
  Tv,
  CheckCircle,
  Clock,
  XCircle,
  Wrench,
  Droplets,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  floor: number | null;
  status: string;
  roomType: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    maxOccupancy: number;
    bedType: string | null;
    size: string | null;
    amenities: string[];
    image: string | null;
  };
  currentBooking: {
    id: string;
    bookingNumber: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    numberOfAdults: number;
    numberOfChildren: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          label: 'Available',
        };
      case 'RESERVED':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Clock,
          label: 'Reserved',
        };
      case 'OCCUPIED':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: DoorOpen,
          label: 'Occupied',
        };
      case 'CLEANING':
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: Droplets,
          label: 'Cleaning',
        };
      case 'MAINTENANCE':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: Wrench,
          label: 'Maintenance',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: XCircle,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(room.status);
  const StatusIcon = statusConfig.icon;

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

  const getAmenityIcon = (amenityName: string) => {
    const lowerName = amenityName.toLowerCase();
    if (lowerName.includes('wifi') || lowerName.includes('internet')) {
      return <Wifi className="w-4 h-4 text-blue-600" />;
    }
    if (lowerName.includes('tv') || lowerName.includes('television')) {
      return <Tv className="w-4 h-4 text-blue-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="grid md:grid-cols-3 gap-0">
        {/* Image Section */}
        <div className="relative h-64 md:h-auto">
          {room.roomType.image ? (
            <img
              src={room.roomType.image}
              alt={`Room ${room.roomNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <DoorOpen className="w-16 h-16 text-blue-600" />
            </div>
          )}
          {/* Status Badge Overlay */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border flex items-center gap-1 shadow-lg backdrop-blur-sm ${statusConfig.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:col-span-2 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                {room.floor && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                    Floor {room.floor}
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-blue-600">{room.roomType.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(room.roomType.basePrice)}
              </p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>

          {/* Description */}
          {room.roomType.description && (
            <p className="text-gray-700 text-sm mb-4">{room.roomType.description}</p>
          )}

          {/* Current Booking Info */}
          {room.currentBooking && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Current Guest
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <User className="w-4 h-4" />
                      <span>
                        {room.currentBooking.guestFirstName} {room.currentBooking.guestLastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Mail className="w-4 h-4" />
                      <span>{room.currentBooking.guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Phone className="w-4 h-4" />
                      <span>{room.currentBooking.guestPhone}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full font-medium">
                  {room.currentBooking.bookingNumber}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-700 pt-3 border-t border-blue-200">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check-in: {formatDate(room.currentBooking.checkInDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check-out: {formatDate(room.currentBooking.checkOutDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Room Details */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm">
                Up to {room.roomType.maxOccupancy} guest{room.roomType.maxOccupancy !== 1 ? 's' : ''}
              </span>
            </div>
            {room.roomType.bedType && (
              <div className="flex items-center gap-2 text-gray-700">
                <Bed className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{room.roomType.bedType}</span>
              </div>
            )}
            {room.roomType.size && (
              <div className="flex items-center gap-2 text-gray-700">
                <DoorOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{room.roomType.size}</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {room.roomType.amenities.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {room.roomType.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs border border-gray-200"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}