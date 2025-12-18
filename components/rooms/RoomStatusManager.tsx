// components/RoomStatusManager.tsx
'use client';

import { useState, useEffect } from 'react';

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomType: {
    name: string;
  };
  currentBooking?: {
    guestFirstName: string;
    guestLastName: string;
    bookingNumber: string;
  } | null;
}

interface RoomStatusManagerProps {
  onStatusChange?: () => void;
}

export default function RoomStatusManager({ onStatusChange }: RoomStatusManagerProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, [filter]);

  // Sort rooms by priority: OCCUPIED > CLEANING > AVAILABLE > RESERVED > MAINTENANCE
  const sortRoomsByPriority = (roomsList: Room[]) => {
    const priorityOrder: Record<string, number> = {
      OCCUPIED: 1,
      CLEANING: 2,
      AVAILABLE: 3,
      RESERVED: 4,
      MAINTENANCE: 5,
    };

    return [...roomsList].sort((a, b) => {
      const priorityA = priorityOrder[a.status] || 999;
      const priorityB = priorityOrder[b.status] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same status, sort by room number
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });
  };

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const params = new URLSearchParams({
        includeCurrentBooking: 'true',
      });
      
      if (filter !== 'ALL') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/rooms?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch rooms');

      const data = await response.json();
      
      // Sort rooms by priority
      const sortedRooms = sortRoomsByPriority(data.rooms);
      setRooms(sortedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update room status
  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      setUpdating(roomId);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      const response = await fetch('/api/rooms', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          roomId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update room status');
      }

      // Close modal and refresh
      setShowStatusModal(false);
      setSelectedRoom(null);
      await fetchRooms();
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update room status');
    } finally {
      setUpdating(null);
    }
  };

  // Get available status transitions
  const getAvailableTransitions = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      OCCUPIED: ['CLEANING', 'AVAILABLE'],
      CLEANING: ['AVAILABLE', 'MAINTENANCE'],
      AVAILABLE: ['MAINTENANCE', 'RESERVED', 'CLEANING'],
      RESERVED: ['OCCUPIED', 'AVAILABLE', 'CANCELLED'],
      MAINTENANCE: ['CLEANING', 'AVAILABLE'],
    };

    return transitions[currentStatus] || [];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'text-green-600 bg-green-50',
      OCCUPIED: 'text-blue-600 bg-blue-50',
      RESERVED: 'text-yellow-600 bg-yellow-50',
      CLEANING: 'text-orange-600 bg-orange-50',
      MAINTENANCE: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
      OCCUPIED: 'bg-blue-100 text-blue-800 border-blue-200',
      RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CLEANING: 'bg-orange-100 text-orange-800 border-orange-200',
      MAINTENANCE: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '✓';
      case 'OCCUPIED':
        return '👤';
      case 'RESERVED':
        return '📅';
      case 'CLEANING':
        return '🧹';
      case 'MAINTENANCE':
        return '🔧';
      default:
        return '•';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Room Status Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                {rooms.length} {filter !== 'ALL' ? filter.toLowerCase() : ''} room{rooms.length !== 1 ? 's' : ''} • Sorted by priority
              </p>
            </div>
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {['ALL', 'OCCUPIED', 'CLEANING', 'AVAILABLE', 'RESERVED', 'MAINTENANCE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All Rooms' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms List - Scrollable Container */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-sm">No rooms found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room, index) => (
                    <tr 
                      key={room.id} 
                      className={`hover:bg-gray-50 transition ${
                        index < 10 ? '' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                            <span className="text-sm font-bold text-gray-700">{room.roomNumber}</span>
                          </div>
                          {index < 10 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Priority
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.roomType.name}</div>
                      </td>
                  
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(room.status)}`}>
                          <span className="mr-1">{getStatusIcon(room.status)}</span>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {room.currentBooking ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {room.currentBooking.guestFirstName} {room.currentBooking.guestLastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {room.currentBooking.bookingNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowStatusModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Scroll Indicator */}
          {!loading && rooms.length > 10 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
              <p className="text-xs text-gray-600 text-center">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Scroll to see {rooms.length - 10} more room{rooms.length - 10 !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Room Status
                </h3>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedRoom(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Room Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Room {selectedRoom.roomNumber}
                    </p>
                    <p className="text-xs text-gray-600">{selectedRoom.roomType.name} • Floor {selectedRoom.floor}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(selectedRoom.status)}`}>
                    <span className="mr-1">{getStatusIcon(selectedRoom.status)}</span>
                    {selectedRoom.status}
                  </span>
                </div>
                
                {selectedRoom.currentBooking && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">Current Guest:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRoom.currentBooking.guestFirstName} {selectedRoom.currentBooking.guestLastName}
                    </p>
                    <p className="text-xs text-gray-500">{selectedRoom.currentBooking.bookingNumber}</p>
                  </div>
                )}
              </div>

              {/* Status Options */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Select New Status:</p>
                <div className="space-y-2">
                  {getAvailableTransitions(selectedRoom.status).map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={() => updateRoomStatus(selectedRoom.id, newStatus)}
                      disabled={updating === selectedRoom.id}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition ${
                        updating === selectedRoom.id
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : `${getStatusColor(newStatus)} border-transparent hover:border-current`
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-lg">{getStatusIcon(newStatus)}</span>
                        <span>{newStatus.replace('_', ' ')}</span>
                      </span>
                      {updating === selectedRoom.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedRoom(null);
                }}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}