// app/admin/rooms/components/CreateRoomDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  pricing: {
    eastAfrican: {
      single: number;
      double: number;
    };
    international: {
      single: number;
      double: number;
    };
  };
  capacity: number;
}

interface NewRoomForm {
  roomNumber: string;
  roomTypeId: string;
  floor: string;
  status: string;
  description: string;
}

interface CreateRoomDialogProps {
  onRoomCreated: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function CreateRoomDialog({
  onRoomCreated,
  onError,
  onSuccess,
}: CreateRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
    const [user, setUser] = useState<{ role: string } | null>(null);

  const [newRoom, setNewRoom] = useState<NewRoomForm>({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    status: 'AVAILABLE',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchRoomTypes();
    }
  }, [isOpen]);

  const fetchRoomTypes = async () => {
    setLoadingRoomTypes(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms/room-types', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }

      const data = await response.json();
      setRoomTypes(data.roomTypes);
    } catch (error) {
      console.error('Error fetching room types:', error);
      onError('Failed to load room types');
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  useEffect(() => {
    // Get user from localStorage when component mounts
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoom.roomTypeId) {
      onError('Please select a room type');
      return;
    }

    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomNumber: newRoom.roomNumber,
          roomTypeId: newRoom.roomTypeId,
          floor: newRoom.floor ? parseInt(newRoom.floor) : null,
          status: newRoom.status,
          description: newRoom.description || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      onSuccess(`Room ${newRoom.roomNumber} created successfully!`);

      // Reset form
      setNewRoom({
        roomNumber: '',
        roomTypeId: '',
        floor: '',
        status: 'AVAILABLE',
        description: '',
      });

      setIsOpen(false);
      onRoomCreated();
    } catch (error: any) {
      onError(error.message || 'Failed to create room');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedRoomType = roomTypes.find((rt) => rt.id === newRoom.roomTypeId);

return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild disabled={user?.role !== 'ADMIN' && user?.role !== 'MANAGER'}>
  <Button 
    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={user?.role !== 'ADMIN' && user?.role !== 'MANAGER'}
  >
    <Plus className="w-5 h-5 mr-2" />
    Add New Room
  </Button>
</DialogTrigger>
    <DialogContent className="bg-white border border-gray-200 text-gray-900 shadow-lg max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-blue-600">Create New Room</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleCreateRoom} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roomNumber" className="text-blue-600">Room Number *</Label>
          <Input
            id="roomNumber"
            value={newRoom.roomNumber}
            onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
            className="bg-gray-50 border border-blue-600 text-gray-900 placeholder-gray-400"
            placeholder="e.g., 101, A-201"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomType" className="text-blue-600">Room Type *</Label>
          {loadingRoomTypes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <Select
              value={newRoom.roomTypeId}
              onValueChange={(value) => setNewRoom({ ...newRoom, roomTypeId: value })}
            >
              <SelectTrigger className="bg-gray-50 border border-blue-600 text-gray-900">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
             <SelectContent className="bg-white border border-gray-200 text-gray-900">
  {roomTypes.map((type) => (
    <SelectItem key={type.id} value={type.id} className="text-gray-900">
      {type.name} - {formatCurrency(type.pricing.eastAfrican.single)} - {formatCurrency(type.pricing.international.double)}/night
    </SelectItem>
  ))}
</SelectContent>
            </Select>
          )}
          {selectedRoomType && (
            <p className="text-xs text-gray-700">
              Capacity: {selectedRoomType.capacity} guest{selectedRoomType.capacity !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor" className="text-blue-600">Floor (Optional)</Label>
          <Input
            id="floor"
            type="number"
            value={newRoom.floor}
            onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
            className="bg-gray-50 border border-blue-600 text-gray-900 placeholder-gray-400"
            placeholder="e.g., 1, 2, 3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-blue-600">Initial Status *</Label>
          <Select
            value={newRoom.status}
            onValueChange={(value) => setNewRoom({ ...newRoom, status: value })}
          >
            <SelectTrigger className="bg-gray-50 border border-blue-600 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 text-gray-900">
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-blue-600">Description (Optional)</Label>
          <Textarea
            id="description"
            value={newRoom.description}
            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            className="bg-gray-50 border border-blue-600 text-gray-900 placeholder-gray-400"
            rows={3}
            placeholder="Any special notes about this room..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50"
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={formLoading || loadingRoomTypes}
          >
            {formLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
}