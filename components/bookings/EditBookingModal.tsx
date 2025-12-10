// components/EditBookingModal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner'

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
    numberOfRooms: number;
    specialRequests?: string;
    status: string;
  };
  onBookingUpdated: () => void;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  bookingData,
  onBookingUpdated,
}: EditBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    guestFirstName: bookingData.guest.firstName,
    guestLastName: bookingData.guest.lastName,
    guestEmail: bookingData.guest.email,
    guestPhone: bookingData.guest.phone,
    checkInDate: bookingData.checkIn.split('T')[0],
    checkOutDate: bookingData.checkOut.split('T')[0],
    specialRequests: bookingData.specialRequests || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Validate dates
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        setError('Check-in date cannot be in the past');
        setIsLoading(false);
        return;
      }

      if (checkOut <= checkIn) {
        setError('Check-out date must be after check-in date');
        setIsLoading(false);
        return;
      }

      // Only allow editing if booking is PENDING or CONFIRMED
      if (!['PENDING', 'CONFIRMED'].includes(bookingData.status)) {
        setError('This booking cannot be edited');
        setIsLoading(false);
        return;
      }

    const response = await fetch(`/api/bookings/${bookingData.bookingId}/guest-edit`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || 'Failed to update booking');
}

      // Success!
      onBookingUpdated();
      onClose();
      
      // Show success message
      toast('✅ Booking updated successfully!\n\nYour changes have been saved.');
      
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Error Message */}
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
                  placeholder="John"
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
                  placeholder="Doe"
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
                placeholder="john.doe@example.com"
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
                placeholder="0712345678"
              />
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Changing dates may affect room availability and pricing. 
                You'll be notified if any conflicts arise.
              </p>
            </div>
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
  );
}