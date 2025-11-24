// app/admin/rooms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, DoorOpen } from 'lucide-react';
import { RoomStats } from '@/components/rooms/RoomStats';
import { RoomFilters } from '@/components/rooms/RoomFilters';
import { RoomCard } from '@/components/rooms/RoomCard';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';

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
  currentBooking: any;
  createdAt: string;
  updatedAt: string;
}

interface RoomType {
  id: string;
  name: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoomType, setFilterRoomType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [filterStatus, filterRoomType]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/rooms?includeCurrentBooking=true';
      const params = new URLSearchParams();

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      if (filterRoomType !== 'all') {
        params.append('roomTypeId', filterRoomType);
      }

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to load rooms',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/room-types', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }

      const data = await response.json();
      setRoomTypes(data.roomTypes);
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  // Filter rooms by search query
  const filteredRooms = rooms.filter((room) => {
    const searchLower = searchQuery.toLowerCase();
    return room.roomNumber.toLowerCase().includes(searchLower);
  });

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.status === 'AVAILABLE').length,
    occupiedRooms: rooms.filter((r) => r.status === 'OCCUPIED').length,
    reservedRooms: rooms.filter((r) => r.status === 'RESERVED').length,
    cleaningRooms: rooms.filter((r) => r.status === 'CLEANING').length,
    maintenanceRooms: rooms.filter((r) => r.status === 'MAINTENANCE').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading rooms...</div>
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
              <span className="text-amber-600">Rooms</span> Management
            </h1>
            <p className="text-gray-600">Manage hotel rooms and availability</p>
          </div>

          <CreateRoomDialog
            onRoomCreated={fetchRooms}
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
        <RoomStats {...stats} />

        {/* Filters */}
        <RoomFilters
          filterStatus={filterStatus}
          filterRoomType={filterRoomType}
          searchQuery={searchQuery}
          roomTypes={roomTypes}
          onStatusChange={setFilterStatus}
          onRoomTypeChange={setFilterRoomType}
          onSearchChange={setSearchQuery}
        />

        {/* Rooms List */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <DoorOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'No rooms match your search criteria.'
                : 'No rooms match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}