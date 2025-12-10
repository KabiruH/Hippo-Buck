'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Loader2, Users, Bed, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RoomType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  maxOccupancy: number;
  bedType: string | null;
  size: string | null;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  availableRooms: number;
  amenities: string[];
  images: Array<{ url: string; isPrimary: boolean }>;
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
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Guest Information
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Booking Details
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);

  // Room Selection
  const [availableRoomTypes, setAvailableRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<Array<{ roomTypeId: string; quantity: number }>>([]);

  // Check availability when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      checkAvailability();
    } else {
      setAvailableRoomTypes([]);
      setSelectedRoomTypes([]);
    }
  }, [checkInDate, checkOutDate]);

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) return;

    setIsCheckingAvailability(true);
    try {
      const response = await fetch(
        `/api/rooms/available?checkIn=${checkInDate.toISOString()}&checkOut=${checkOutDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const data = await response.json();
      setAvailableRoomTypes(data.availableRoomTypes || []);

      if (!data.availableRoomTypes || data.availableRoomTypes.length === 0) {
        toast.warning('No rooms available for selected dates');
      }
    } catch (error) {
      console.error('Availability check error:', error);
      toast.error('Failed to check room availability');
      setAvailableRoomTypes([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const addRoomType = (roomTypeId: string) => {
    const existing = selectedRoomTypes.find((rt) => rt.roomTypeId === roomTypeId);
    if (existing) {
      setSelectedRoomTypes(
        selectedRoomTypes.map((rt) =>
          rt.roomTypeId === roomTypeId ? { ...rt, quantity: rt.quantity + 1 } : rt
        )
      );
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, { roomTypeId, quantity: 1 }]);
    }
  };

  const removeRoomType = (roomTypeId: string) => {
    const existing = selectedRoomTypes.find((rt) => rt.roomTypeId === roomTypeId);
    if (existing && existing.quantity > 1) {
      setSelectedRoomTypes(
        selectedRoomTypes.map((rt) =>
          rt.roomTypeId === roomTypeId ? { ...rt, quantity: rt.quantity - 1 } : rt
        )
      );
    } else {
      setSelectedRoomTypes(selectedRoomTypes.filter((rt) => rt.roomTypeId !== roomTypeId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!guestFirstName || !guestLastName || !guestEmail || !guestPhone) {
        throw new Error('Please fill in all guest information');
      }

      if (!checkInDate || !checkOutDate) {
        throw new Error('Please select check-in and check-out dates');
      }

      if (selectedRoomTypes.length === 0) {
        throw new Error('Please select at least one room');
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guestFirstName,
          guestLastName,
          guestEmail,
          guestPhone,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          numberOfAdults,
          numberOfChildren,
          roomTypes: selectedRoomTypes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      onSuccess(`Booking ${data.booking.bookingNumber} created successfully!`);
      setOpen(false);
      onBookingCreated();

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Create booking error:', error);
      onError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setGuestFirstName('');
    setGuestLastName('');
    setGuestEmail('');
    setGuestPhone('');
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setNumberOfAdults(1);
    setNumberOfChildren(0);
    setAvailableRoomTypes([]);
    setSelectedRoomTypes([]);
  };

  const calculateTotal = () => {
    return selectedRoomTypes.reduce((total, selected) => {
      const roomType = availableRoomTypes.find((rt) => rt.id === selected.roomTypeId);
      if (!roomType) return total;
      return total + roomType.totalPrice * selected.quantity;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const numberOfNights =
    availableRoomTypes.length > 0 ? availableRoomTypes[0].nights : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Add a new booking for a guest</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="0712345678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Check-in Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>
                  Check-out Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => !checkInDate || date <= checkInDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Number of Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={numberOfAdults}
                  onChange={(e) => setNumberOfAdults(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Number of Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={numberOfChildren}
                  onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {numberOfNights > 0 && (
              <p className="text-sm text-gray-600">
                {numberOfNights} night{numberOfNights !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Available Room Types */}
          {checkInDate && checkOutDate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Select Room Types</h3>
                {isCheckingAvailability && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                )}
              </div>

              {availableRoomTypes.length === 0 && !isCheckingAvailability ? (
                <div className="text-center py-8 text-gray-500">
                  No rooms available for the selected dates
                </div>
              ) : (
                <div className="space-y-3">
                  {availableRoomTypes.map((roomType) => {
                    const selected = selectedRoomTypes.find(
                      (rt) => rt.roomTypeId === roomType.id
                    );
                    const selectedQuantity = selected?.quantity || 0;
                    const primaryImage = roomType.images.find((img) => img.isPrimary)?.url;

                    return (
                      <div
                        key={roomType.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          {primaryImage && (
                            <div className="md:w-48 h-40 md:h-auto">
                              <img
                                src={primaryImage}
                                alt={roomType.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-lg">
                                  {roomType.name}
                                </h4>
                                {roomType.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {roomType.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    Up to {roomType.maxOccupancy}
                                  </span>
                                  {roomType.bedType && (
                                    <span className="flex items-center gap-1">
                                      <Bed className="w-4 h-4" />
                                      {roomType.bedType}
                                    </span>
                                  )}
                                  {roomType.size && (
                                    <span className="flex items-center gap-1">
                                      <Maximize2 className="w-4 h-4" />
                                      {roomType.size}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  {roomType.availableRooms} room{roomType.availableRooms !== 1 ? 's' : ''} available
                                </p>
                                <p className="text-lg font-semibold text-blue-600 mt-2">
                                  {formatCurrency(roomType.pricePerNight)} / night
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 ml-4">
                                {selectedQuantity > 0 && (
                                  <>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeRoomType(roomType.id)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                    <span className="min-w-8 text-center font-medium">
                                      {selectedQuantity}
                                    </span>
                                  </>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addRoomType(roomType.id)}
                                  disabled={selectedQuantity >= roomType.availableRooms}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Selected Summary */}
                            {selectedQuantity > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {selectedQuantity} × {formatCurrency(roomType.pricePerNight)} × {numberOfNights} nights
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(roomType.totalPrice * selectedQuantity)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Total */}
          {selectedRoomTypes.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedRoomTypes.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Booking'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}