// app/admin/bookings/components/CreateBookingDialog.tsx
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
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Room {
  id: string;
  roomNumber: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
  };
  status: string;
}

interface NewBookingForm {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  numberOfAdults: number;
  numberOfChildren: number;
  selectedRooms: string[];
  specialRequests: string;
  manualConfirm: boolean;
}

interface CreateBookingDialogProps {
  onBookingCreated: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function CreateBookingDialog({
  onBookingCreated,
  onError,
  onSuccess,
}: CreateBookingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [newBooking, setNewBooking] = useState<NewBookingForm>({
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    guestCountry: 'Kenya',
    checkInDate: undefined,
    checkOutDate: undefined,
    numberOfAdults: 1,
    numberOfChildren: 0,
    selectedRooms: [],
    specialRequests: '',
    manualConfirm: true,
  });

  // Fetch available rooms when dates change
  useEffect(() => {
    if (newBooking.checkInDate && newBooking.checkOutDate) {
      fetchAvailableRooms();
    }
  }, [newBooking.checkInDate, newBooking.checkOutDate]);

  const fetchAvailableRooms = async () => {
    if (!newBooking.checkInDate || !newBooking.checkOutDate) return;

    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        checkIn: newBooking.checkInDate.toISOString(),
        checkOut: newBooking.checkOutDate.toISOString(),
      });

      const response = await fetch(`/api/rooms/available?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available rooms');
      }

      const data = await response.json();
      setAvailableRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      onError('Failed to load available rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomToggle = (roomId: string) => {
    setNewBooking((prev) => ({
      ...prev,
      selectedRooms: prev.selectedRooms.includes(roomId)
        ? prev.selectedRooms.filter((id) => id !== roomId)
        : [...prev.selectedRooms, roomId],
    }));
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBooking.checkInDate || !newBooking.checkOutDate) {
      onError('Please select check-in and check-out dates');
      return;
    }

    if (newBooking.selectedRooms.length === 0) {
      onError('Please select at least one room');
      return;
    }

    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestFirstName: newBooking.guestFirstName,
          guestLastName: newBooking.guestLastName,
          guestEmail: newBooking.guestEmail,
          guestPhone: newBooking.guestPhone,
          guestCountry: newBooking.guestCountry,
          checkInDate: newBooking.checkInDate.toISOString(),
          checkOutDate: newBooking.checkOutDate.toISOString(),
          numberOfAdults: newBooking.numberOfAdults,
          numberOfChildren: newBooking.numberOfChildren,
          roomIds: newBooking.selectedRooms,
          specialRequests: newBooking.specialRequests || null,
          manualConfirm: newBooking.manualConfirm,
          paidAmount: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      onSuccess(
        `Booking ${data.booking.bookingNumber} created successfully for ${newBooking.guestFirstName} ${newBooking.guestLastName}!`
      );

      // Reset form
      setNewBooking({
        guestFirstName: '',
        guestLastName: '',
        guestEmail: '',
        guestPhone: '',
        guestCountry: 'Kenya',
        checkInDate: undefined,
        checkOutDate: undefined,
        numberOfAdults: 1,
        numberOfChildren: 0,
        selectedRooms: [],
        specialRequests: '',
        manualConfirm: true,
      });
      setAvailableRooms([]);

      setIsOpen(false);
      onBookingCreated();
    } catch (error: any) {
      onError(error.message || 'Failed to create booking');
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

return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="w-5 h-5 mr-2" />
        Create Booking
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Create New Booking</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleCreateBooking} className="space-y-6">
        {/* Guest Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newBooking.guestFirstName}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guestFirstName: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={newBooking.guestLastName}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, guestLastName: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newBooking.guestEmail}
                onChange={(e) => setNewBooking({ ...newBooking, guestEmail: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={newBooking.guestPhone}
                onChange={(e) => setNewBooking({ ...newBooking, guestPhone: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={newBooking.guestCountry}
              onChange={(e) => setNewBooking({ ...newBooking, guestCountry: e.target.value })}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>

        {/* Stay Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Stay Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white border-gray-300 text-gray-900"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                    {newBooking.checkInDate
                      ? newBooking.checkInDate.toLocaleDateString()
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={newBooking.checkInDate}
                    onSelect={(date) =>
                      setNewBooking({ ...newBooking, checkInDate: date })
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white border-gray-300 text-gray-900"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                    {newBooking.checkOutDate
                      ? newBooking.checkOutDate.toLocaleDateString()
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={newBooking.checkOutDate}
                    onSelect={(date) =>
                      setNewBooking({ ...newBooking, checkOutDate: date })
                    }
                    disabled={(date) =>
                      date < new Date() ||
                      (newBooking.checkInDate ? date <= newBooking.checkInDate : false)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Number of Adults *</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                value={newBooking.numberOfAdults}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, numberOfAdults: parseInt(e.target.value) })
                }
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Number of Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={newBooking.numberOfChildren}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, numberOfChildren: parseInt(e.target.value) })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Room(s)</h3>
          {loadingRooms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading available rooms...</span>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {newBooking.checkInDate && newBooking.checkOutDate
                ? 'No rooms available for selected dates'
                : 'Please select check-in and check-out dates to see available rooms'}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`room-${room.id}`}
                      checked={newBooking.selectedRooms.includes(room.id)}
                      onCheckedChange={() => handleRoomToggle(room.id)}
                    />
                    <label htmlFor={`room-${room.id}`} className="cursor-pointer">
                      <p className="font-medium text-gray-900">
                        Room {room.roomNumber} - {room.roomType.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(room.roomType.basePrice)} per night
                      </p>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            value={newBooking.specialRequests}
            onChange={(e) =>
              setNewBooking({ ...newBooking, specialRequests: e.target.value })
            }
            className="bg-white border-gray-300 text-gray-900"
            rows={3}
            placeholder="Any special requests or requirements..."
          />
        </div>

        {/* Manual Confirm Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="manualConfirm"
            checked={newBooking.manualConfirm}
            onCheckedChange={(checked) =>
              setNewBooking({ ...newBooking, manualConfirm: checked as boolean })
            }
          />
          <Label htmlFor="manualConfirm" className="text-sm cursor-pointer">
            Confirm booking immediately (without payment)
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 border-gray-300 hover:bg-gray-50"
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Booking'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
}