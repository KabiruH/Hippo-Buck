// components/EditBookingModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, User, Mail, Phone, MessageSquare, Loader2, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingId: string;
    bookingNumber: string;
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    checkIn: string;
    checkOut: string;
    totalGuests: number;
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfRooms: number;
    specialRequests?: string;
    status: string;
  };
  onBookingUpdated: () => void;
}

// In EditBookingModal.tsx, update the PriceBreakdown interface:

interface PriceBreakdown {
  originalTotal: number;
  newTotal: number;
  difference: number;
  originalNights: number;
  newNights: number;
  originalAdults: number;
  newAdults: number;
  isEastAfrican: boolean;
  currency: string;
  rooms: Array<{
    roomNumber: string;
    roomType: string;
    roomTypeId: string;
    // All pricing from RoomType table
    singlePriceEA: number;
    doublePriceEA: number;
    singlePriceIntl: number;
    doublePriceIntl: number;
    // Current calculation
    oldPrice: number;
    oldPricePerNight: number;
    oldNights: number;
    oldOccupancy: string;
    // New calculation
    newPrice: number;
    newPricePerNight: number;
    newNights: number;
    newOccupancy: string;
  }>;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  bookingData,
  onBookingUpdated,
}: EditBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    guestFirstName: bookingData.guest.firstName,
    guestLastName: bookingData.guest.lastName,
    guestEmail: bookingData.guest.email,
    guestPhone: bookingData.guest.phone,
    checkInDate: bookingData.checkIn.split('T')[0],
    checkOutDate: bookingData.checkOut.split('T')[0],
    numberOfAdults: bookingData.numberOfAdults,
    numberOfChildren: bookingData.numberOfChildren,
    specialRequests: bookingData.specialRequests || '',
  });

  const [originalData] = useState({
    checkIn: bookingData.checkIn.split('T')[0],
    checkOut: bookingData.checkOut.split('T')[0],
    numberOfAdults: bookingData.numberOfAdults,
  });

  const dataChanged = 
    formData.checkInDate !== originalData.checkIn || 
    formData.checkOutDate !== originalData.checkOut ||
    formData.numberOfAdults !== originalData.numberOfAdults;

  const totalGuests = formData.numberOfAdults + formData.numberOfChildren;

  useEffect(() => {
    if (dataChanged && formData.checkInDate && formData.checkOutDate) {
      checkPriceChange();
    } else {
      setPriceBreakdown(null);
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.numberOfAdults]);

  const checkPriceChange = async () => {
    setIsCheckingPrice(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingData.bookingId}/price-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newCheckInDate: formData.checkInDate,
          newCheckOutDate: formData.checkOutDate,
          numberOfAdults: formData.numberOfAdults,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check pricing');
      }

      setPriceBreakdown(data.priceBreakdown);
    } catch (error) {
      console.error('Price check error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check pricing');
      setPriceBreakdown(null);
    } finally {
      setIsCheckingPrice(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'numberOfAdults' || name === 'numberOfChildren') {
      const numValue = parseInt(value) || 0;
      
      // Validate 2-guest maximum
      if (name === 'numberOfAdults') {
        if (numValue + formData.numberOfChildren > 2) {
          toast.error('Maximum 2 guests per room');
          return;
        }
      } else {
        if (formData.numberOfAdults + numValue > 2) {
          toast.error('Maximum 2 guests per room');
          return;
        }
      }
      
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    setError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (totalGuests > 2) {
      setError('Maximum 2 guests per room allowed');
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(bookingData.status)) {
      setError('This booking cannot be edited');
      return;
    }

    if (dataChanged && priceBreakdown && priceBreakdown.difference !== 0) {
      setShowConfirmDialog(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingData.bookingId}/guest-edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      onBookingUpdated();
      onClose();
      
      if (data.priceChanged && data.difference !== 0) {
        const priceChange = data.difference > 0 
          ? `Additional ${formatCurrency(data.difference)} due`
          : `Refund of ${formatCurrency(Math.abs(data.difference))}`;
        
        toast.success('Booking updated successfully!', {
          description: `${priceChange}. New total: ${formatCurrency(data.newTotal)}`,
        });
      } else {
        toast.success('Booking updated successfully!', {
          description: 'Your changes have been saved.',
        });
      }
      
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = priceBreakdown?.currency || 'KES';
    return new Intl.NumberFormat(currency === 'KES' ? 'en-KE' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Edit Booking
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Booking Reference: <span className="font-mono font-bold text-blue-600">{bookingData.bookingNumber}</span>
                </DialogDescription>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Guest Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Guest Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestFirstName" className="text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="guestFirstName"
                    name="guestFirstName"
                    value={formData.guestFirstName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guestLastName" className="text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="guestLastName"
                    name="guestLastName"
                    value={formData.guestLastName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guestEmail" className="text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="guestEmail"
                  name="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="guestPhone" className="text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="guestPhone"
                  name="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Guest Count & Occupancy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Guest Count</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfAdults" className="text-gray-700">
                    Number of Adults *
                  </Label>
                  <Input
                    id="numberOfAdults"
                    name="numberOfAdults"
                    type="number"
                    min="1"
                    max="2"
                    value={formData.numberOfAdults}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.numberOfAdults === 1 ? 'Single occupancy' : 'Double occupancy'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="numberOfChildren" className="text-gray-700">
                    Number of Children
                  </Label>
                  <Input
                    id="numberOfChildren"
                    name="numberOfChildren"
                    type="number"
                    min="0"
                    max={2 - formData.numberOfAdults}
                    value={formData.numberOfChildren}
                    onChange={handleChange}
                    className="mt-1"
                    disabled={totalGuests >= 2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {totalGuests}/2 guests
                  </p>
                </div>
              </div>
            </div>

            {/* Check-in/Check-out Dates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Stay Dates</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate" className="text-gray-700">
                    Check-in Date *
                  </Label>
                  <Input
                    id="checkInDate"
                    name="checkInDate"
                    type="date"
                    value={formData.checkInDate}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="checkOutDate" className="text-gray-700">
                    Check-out Date *
                  </Label>
                  <Input
                    id="checkOutDate"
                    name="checkOutDate"
                    type="date"
                    value={formData.checkOutDate}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    min={formData.checkInDate}
                  />
                </div>
              </div>

              {isCheckingPrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-blue-800 text-sm">Recalculating pricing...</p>
                </div>
              )}

             
{priceBreakdown && !isCheckingPrice && (
  <div className={`border rounded-lg p-4 ${
    priceBreakdown.difference > 0 
      ? 'bg-orange-50 border-orange-200' 
      : priceBreakdown.difference < 0 
      ? 'bg-green-50 border-green-200' 
      : 'bg-blue-50 border-blue-200'
  }`}>
    <div className="flex items-start gap-2 mb-3">
      <AlertCircle className={`w-5 h-5 mt-0.5 ${
        priceBreakdown.difference > 0 
          ? 'text-orange-600' 
          : priceBreakdown.difference < 0 
          ? 'text-green-600' 
          : 'text-blue-600'
      }`} />
      <div className="flex-1">
        <p className={`font-semibold ${
          priceBreakdown.difference > 0 
            ? 'text-orange-900' 
            : priceBreakdown.difference < 0 
            ? 'text-green-900' 
            : 'text-blue-900'
        }`}>
          {priceBreakdown.difference > 0 && 'Price Increase'}
          {priceBreakdown.difference < 0 && 'Price Decrease'}
          {priceBreakdown.difference === 0 && 'No Price Change'}
        </p>
        <p className={`text-sm mt-1 ${
          priceBreakdown.difference > 0 
            ? 'text-orange-800' 
            : priceBreakdown.difference < 0 
            ? 'text-green-800' 
            : 'text-blue-800'
        }`}>
          {priceBreakdown.originalAdults !== priceBreakdown.newAdults && (
            <span>
              Bed type changed from <strong>{priceBreakdown.originalAdults === 1 ? 'Single' : 'Double'}</strong> to <strong>{priceBreakdown.newAdults === 1 ? 'Single' : 'Double'}</strong>.{' '}
            </span>
          )}
          {priceBreakdown.originalNights !== priceBreakdown.newNights && (
            <span>
              Duration changed from <strong>{priceBreakdown.originalNights}</strong> to <strong>{priceBreakdown.newNights}</strong> nights.
            </span>
          )}
        </p>
      </div>
    </div>

    {/* Summary */}
    <div className="space-y-2 text-sm mb-3">
      <div className="flex justify-between">
        <span className="text-gray-700">
          Current ({priceBreakdown.originalAdults === 1 ? 'Single' : 'Double'} × {priceBreakdown.originalNights} nights):
        </span>
        <span className="font-medium">{formatCurrency(priceBreakdown.originalTotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-700">
          New ({priceBreakdown.newAdults === 1 ? 'Single' : 'Double'} × {priceBreakdown.newNights} nights):
        </span>
        <span className="font-semibold">{formatCurrency(priceBreakdown.newTotal)}</span>
      </div>
      {priceBreakdown.difference !== 0 && (
        <div className={`flex justify-between pt-2 border-t ${
          priceBreakdown.difference > 0 
            ? 'border-orange-200' 
            : 'border-green-200'
        }`}>
          <span className={`font-semibold ${
            priceBreakdown.difference > 0 
              ? 'text-orange-900' 
              : 'text-green-900'
          }`}>
            {priceBreakdown.difference > 0 ? 'Additional Payment:' : 'Refund Amount:'}
          </span>
          <span className={`font-bold ${
            priceBreakdown.difference > 0 
              ? 'text-orange-900' 
              : 'text-green-900'
          }`}>
            {formatCurrency(Math.abs(priceBreakdown.difference))}
          </span>
        </div>
      )}
    </div>

           {/* Detailed Room Breakdown */}
    {priceBreakdown.rooms && priceBreakdown.rooms.length > 0 && (
      <div className="border-t border-gray-300 pt-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Room-by-Room Breakdown:</p>
        {priceBreakdown.rooms.map((room, index) => (
          <div key={index} className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="font-medium text-gray-900 mb-2 flex items-center justify-between">
              <span>Room {room.roomNumber} - {room.roomType}</span>
            </div>

            {/* Show all available pricing options */}
            <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded">
              <p className="font-semibold mb-1">Available Rates (per night):</p>
              <div className="grid grid-cols-2 gap-1">
                <div>Single: {formatCurrency(priceBreakdown.isEastAfrican ? room.singlePriceEA : room.singlePriceIntl)}</div>
                <div>Double: {formatCurrency(priceBreakdown.isEastAfrican ? room.doublePriceEA : room.doublePriceIntl)}</div>
              </div>
            </div>

            {/* Current vs New */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Current <span className="font-medium text-gray-800">({room.oldOccupancy})</span>:
                </span>
                <span className="text-gray-700">
                  {formatCurrency(room.oldPricePerNight)} × {room.oldNights} night{room.oldNights !== 1 ? 's' : ''} = <span className="font-semibold">{formatCurrency(room.oldPrice)}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  New <span className="font-medium text-gray-800">({room.newOccupancy})</span>:
                </span>
                <span className="text-gray-700">
                  {formatCurrency(room.newPricePerNight)} × {room.newNights} night{room.newNights !== 1 ? 's' : ''} = <span className="font-semibold">{formatCurrency(room.newPrice)}</span>
                </span>
              </div>
              {room.oldPrice !== room.newPrice && (
                <div className={`flex justify-between items-center pt-1 border-t ${
                  room.newPrice > room.oldPrice ? 'text-orange-700' : 'text-green-700'
                }`}>
                  <span className="font-semibold">Difference:</span>
                  <span className="font-bold">
                    {room.newPrice > room.oldPrice ? '+' : ''}{formatCurrency(room.newPrice - room.oldPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
              )}

              {!dataChanged && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Changing dates or occupancy may affect pricing.
                  </p>
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Special Requests</h3>
              </div>

              <div>
                <Label htmlFor="specialRequests" className="text-gray-700">
                  Any special requirements? (Optional)
                </Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="mt-1"
                  rows={4}
                  placeholder="Early check-in, extra towels, dietary requirements, etc."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || isCheckingPrice}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Price Change Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {priceBreakdown && priceBreakdown.difference !== 0 && (
                <div className="space-y-3">
                  <p>
                    Your changes will {priceBreakdown.difference > 0 ? 'increase' : 'decrease'} the booking total:
                  </p>
                  <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Original:</span>
                      <span className="font-medium">{formatCurrency(priceBreakdown.originalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New:</span>
                      <span className="font-semibold">{formatCurrency(priceBreakdown.newTotal)}</span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t font-bold ${
                      priceBreakdown.difference > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      <span>{priceBreakdown.difference > 0 ? 'Additional:' : 'Refund:'}</span>
                      <span>{formatCurrency(Math.abs(priceBreakdown.difference))}</span>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}