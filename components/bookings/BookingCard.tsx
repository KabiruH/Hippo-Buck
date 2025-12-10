import { useState } from 'react';
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
  Banknote,
  Smartphone,
  Loader2,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
  onApprove: (bookingId: string) => void;
  onCancel: (bookingId: string, bookingNumber: string) => void;
  isLoading: boolean;
}

export function BookingCard({ booking, onApprove, onCancel, isLoading }: BookingCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'manual' | 'stk'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Manual Payment State
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CASH'>('MPESA');
  const [paymentAmount, setPaymentAmount] = useState(
    (Number(booking.totalAmount) - Number(booking.paidAmount)).toString()
  );
  const [mpesaCode, setMpesaCode] = useState('');
  const [notes, setNotes] = useState('');

  // STK Push State
  const [stkPhoneNumber, setStkPhoneNumber] = useState(booking.guestPhone);
  const [stkAmount, setStkAmount] = useState(
    (Number(booking.totalAmount) - Number(booking.paidAmount)).toString()
  );

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
  const hasOutstandingBalance = remainingBalance > 0;

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

  const handleApproveClick = () => {
    setShowPaymentDialog(true);
  };

  const handleCompletePaymentClick = () => {
    // Pre-fill with remaining balance
    setPaymentAmount(remainingBalance.toString());
    setStkAmount(remainingBalance.toString());
    setShowPaymentDialog(true);
  };

  // Manual Payment Recording
  const handleManualPayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(paymentAmount),
          paymentMethod: paymentMethod,
          transactionId: paymentMethod === 'MPESA' ? mpesaCode : undefined,
          notes: notes || `${paymentMethod} payment recorded by admin`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      toast.success('Payment recorded successfully!', {
        description: `${formatCurrency(Number(paymentAmount))} recorded for ${booking.bookingNumber}`,
      });

      setShowPaymentDialog(false);

      // Reset form
      setPaymentAmount((Number(booking.totalAmount) - Number(booking.paidAmount)).toString());
      setMpesaCode('');
      setNotes('');

      if (onApprove) {
        onApprove(booking.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to record payment', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // STK Push Payment
  const handleStkPush = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(stkAmount),
          phoneNumber: stkPhoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate M-Pesa payment');
      }

      toast.success('M-Pesa payment initiated!', {
        description: "Please check the customer's phone for the M-Pesa prompt",
      });

      setShowPaymentDialog(false);

      setTimeout(() => {
        toast.info('Waiting for payment confirmation...', {
          description: 'The booking will be automatically confirmed once payment is received',
          duration: 5000,
        });
      }, 1000);
    } catch (error) {
      console.error('STK Push error:', error);
      toast.error('Failed to initiate M-Pesa payment', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidManualPayment = () => {
    const amount = Number(paymentAmount);
    if (amount <= 0 || amount > remainingBalance) return false;
    if (paymentMethod === 'MPESA' && !mpesaCode.trim()) return false;
    return true;
  };

  const isValidStkPayment = () => {
    const amount = Number(stkAmount);
    if (amount <= 0 || amount > remainingBalance) return false;
    if (!stkPhoneNumber.trim()) return false;
    return true;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Booking Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">{booking.bookingNumber}</h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${statusConfig.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {guestName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(booking.checkInDate)}
              </span>
              <span className="flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5" />
                {booking.rooms.length} room{booking.rooms.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Right: Amount & Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(Number(booking.totalAmount))}
              </p>
              {hasOutstandingBalance && (
                <p className="text-xs text-orange-600 font-medium">
                  Due: {formatCurrency(remainingBalance)}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {/* Pending Bookings */}
              {booking.status === 'PENDING' && (
                <>
                  <Button
                    onClick={handleApproveClick}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    title="Record Payment"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onCancel(booking.id, booking.bookingNumber)}
                    disabled={isLoading}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                    title="Cancel Booking"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Confirmed/Checked-in Bookings with Outstanding Balance */}
              {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
                <>
                  {hasOutstandingBalance && (
                    <Button
                      onClick={handleCompletePaymentClick}
                      disabled={isLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      title="Complete Payment"
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => onCancel(booking.id, booking.bookingNumber)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    title="Cancel Booking"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Expand Button */}
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="ghost"
                className="text-gray-600"
                title={isExpanded ? 'Show Less' : 'Show More'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Guest Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                  Guest Information
                </h4>
                <div className="space-y-2">
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
                        `, ${booking.numberOfChildren} Child${
                          booking.numberOfChildren !== 1 ? 'ren' : ''
                        }`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                  Stay Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-medium">Check-in:</span>{' '}
                      {formatDate(booking.checkInDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-medium">Check-out:</span>{' '}
                      {formatDate(booking.checkOutDate)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-2">
                Room(s) Booked
              </h4>
              <div className="space-y-2">
                {booking.rooms.map((bookingRoom, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-gray-900 font-medium text-sm">
                          Room {bookingRoom.room.roomNumber}
                        </p>
                        <p className="text-gray-700 text-xs">{bookingRoom.room.roomType.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-semibold text-sm">
                        {formatCurrency(Number(bookingRoom.totalPrice))}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {formatCurrency(Number(bookingRoom.ratePerNight))} ×{' '}
                        {bookingRoom.numberOfNights}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-700">Total Amount:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(Number(booking.totalAmount))}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-700">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(Number(booking.paidAmount))}
                </span>
              </div>
              {hasOutstandingBalance && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Balance Due:</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              )}
            </div>

            {/* Complete Payment Button in Expanded View */}
            {hasOutstandingBalance &&
              (booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
                <Button
                  onClick={handleCompletePaymentClick}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Payment ({formatCurrency(remainingBalance)})
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for booking {booking.bookingNumber}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={paymentTab} onValueChange={(v: any) => setPaymentTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="stk">M-Pesa STK Push</TabsTrigger>
            </TabsList>

            {/* Manual Payment Tab */}
            <TabsContent value="manual" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="MPESA" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">M-Pesa</p>
                        <p className="text-xs text-gray-600">Customer already paid via M-Pesa</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Cash</p>
                        <p className="text-xs text-gray-600">Cash payment received</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={remainingBalance}
                />
                <p className="text-xs text-gray-600">
                  Balance due: {formatCurrency(remainingBalance)}
                </p>
              </div>

              {paymentMethod === 'MPESA' && (
                <div className="space-y-2">
                  <Label htmlFor="mpesa-code">
                    M-Pesa Transaction Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mpesa-code"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SH12ABC34D"
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-600">
                    Enter the M-Pesa confirmation code from the customer
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleManualPayment}
                  disabled={!isValidManualPayment() || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* STK Push Tab */}
            <TabsContent value="stk" className="space-y-4 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> A payment prompt will be sent to the customer's
                  phone. They'll enter their M-Pesa PIN to complete the payment. The booking will be
                  automatically confirmed once payment is received.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stk-phone">Customer Phone Number</Label>
                <Input
                  id="stk-phone"
                  value={stkPhoneNumber}
                  onChange={(e) => setStkPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                />
                <p className="text-xs text-gray-600">Format: 254712345678 or 0712345678</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stk-amount">Payment Amount</Label>
                <Input
                  id="stk-amount"
                  type="number"
                  value={stkAmount}
                  onChange={(e) => setStkAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={remainingBalance}
                />
                <p className="text-xs text-gray-600">
                  Balance due: {formatCurrency(remainingBalance)}
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStkPush}
                  disabled={!isValidStkPayment() || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Send M-Pesa Prompt
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}