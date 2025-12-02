'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BookingData {
  room: string;
  roomId: string;
  region: string;
  bedType: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: number;
  adultsPerRoom: number;
  childrenPerRoom: number;
  totalGuests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // M-Pesa form data
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [copiedTill, setCopiedTill] = useState(false);
  const [copiedPaybill, setCopiedPaybill] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Card form data
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    // Get booking data from sessionStorage
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
      // Pre-fill M-Pesa phone with booking phone
      setMpesaPhone(parsed.guest.phone);
    } else {
      // No booking data, redirect to booking page
      router.push('/booking');
    }
  }, [router]);

 const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    
    // Open modal to show payment instructions
    setShowMpesaModal(true);
  };

  const handleMpesaCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Submit M-Pesa code for verification
      const response = await fetch('/api/payment/mpesa-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mpesaCode,
          phone: mpesaPhone,
          amount: bookingData?.totalPrice,
          bookingData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentSuccess(true);
        setShowMpesaModal(false);
        
        // Store booking confirmation data
        sessionStorage.setItem('bookingConfirmation', JSON.stringify({
          ...bookingData,
          mpesaCode,
          paymentMethod: 'mpesa',
          bookingReference: data.bookingReference,
          paymentStatus: 'pending_verification',
        }));
        
        setTimeout(() => {
          router.push('/booking-confirmation');
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Payment verification failed');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Failed to verify payment. Please contact support.');
      console.error('M-Pesa verification error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, type: 'till' | 'paybill' | 'account') => {
    navigator.clipboard.writeText(text);
    
    if (type === 'till') {
      setCopiedTill(true);
      setTimeout(() => setCopiedTill(false), 2000);
    } else if (type === 'paybill') {
      setCopiedPaybill(true);
      setTimeout(() => setCopiedPaybill(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError('');

    try {
      // TODO: Integrate with Stripe API
      // This is a placeholder - you'll need to implement the actual Stripe integration
      
      const response = await fetch('/api/payment/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber,
          cardName,
          cardExpiry,
          cardCvv,
          amount: bookingData?.totalPrice,
          currency: bookingData?.currency,
          bookingData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show success and redirect
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push('/booking-confirmation');
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setPaymentError('Card payment failed. Please try again.');
      console.error('Card payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <Card className="bg-zinc-900 border-green-500/30 max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
            <p className="text-gray-300">
              Your booking has been confirmed. Redirecting to confirmation page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  

return (
  <main className="min-h-screen bg-gray-50">
    {/* Hero Section */}
    <section className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/2.jpg"
          alt="Payment"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/40" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto space-y-2 md:space-y-4">
          <Lock className="w-12 h-12 md:w-16 md:h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide">
            Secure <span className="text-blue-300">Payment</span>
          </h1>
          <p className="text-sm md:text-lg text-white/90">
            Complete your booking payment
          </p>
        </div>
      </div>
    </section>

    {/* Payment Section */}
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-blue-700 hover:text-blue-900 mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </Button>
      
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-blue-800">
                    Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as 'mpesa' | 'card')
                    }
                    className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-200">
                    <TabsTrigger
                      value="mpesa"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      M-Pesa
                    </TabsTrigger>
                    <TabsTrigger
                      value="card"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </TabsTrigger>
                  </TabsList>

                  {/* M-Pesa Payment */}
                       <TabsContent value="mpesa" className="mt-6">
                      <form onSubmit={handleMpesaPayment} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Smartphone className="w-8 h-8 text-green-600" />
                            <div>
                              <h3 className="text-green-800 font-semibold text-sm md:text-base">
                                M-Pesa Payment
                              </h3>
                              <p className="text-green-700/70 text-xs md:text-sm">
                                Pay via Till Number or Paybill
                              </p>
                            </div>
                          </div>

    <div className="space-y-2">
                            <Label htmlFor="mpesaPhone" className="text-blue-900">
                              Your M-Pesa Phone Number
                            </Label>
                            <Input
                              id="mpesaPhone"
                              type="tel"
                              placeholder="254712345678"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              className="bg-white border-gray-300 text-blue-900 text-lg"
                              required
                            />
                            <p className="text-xs text-blue-600/70">
                              Enter the phone number you'll use to make the payment
                            </p>
                          </div>

                       <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-blue-900 font-semibold mb-3 text-sm">
                              How to Pay:
                            </h4>
                            <ol className="space-y-2 text-blue-700 text-xs md:text-sm">
                              <li>1. Click "Proceed to Payment"</li>
                              <li>2. You'll see our Till Number and Paybill details</li>
                              <li>3. Send the exact amount via M-Pesa</li>
                              <li>4. Enter your M-Pesa confirmation code</li>
                              <li>5. We'll verify and confirm your booking</li>
                            </ol>
                          </div>
                        </div>

{paymentError && (
                          <div className="flex items-center gap-2 p-4 bg-red-100 border border-red-300 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-600 text-sm">{paymentError}</p>
                          </div>
                        )}

                       <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={!mpesaPhone}
                        >
                          <Smartphone className="w-5 h-5 mr-2" />
                          Proceed to Payment
                        </Button>
                      </form>
                    </TabsContent>

                  {/* Card Payment */}
                  <TabsContent value="card" className="mt-6">
                    <form onSubmit={handleCardPayment} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                          <CreditCard className="w-8 h-8 text-blue-600" />
                          <div>
                            <h3 className="text-blue-800 font-semibold text-sm md:text-base">
                              Credit/Debit Card
                            </h3>
                            <p className="text-blue-700/70 text-xs md:text-sm">
                              Secure payment via Stripe
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="text-blue-900">
                            Card Number
                          </Label>
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) =>
                              setCardNumber(formatCardNumber(e.target.value))
                            }
                            maxLength={19}
                            className="bg-white border-gray-300 text-blue-900 text-lg"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardName" className="text-blue-900">
                            Cardholder Name
                          </Label>
                          <Input
                            id="cardName"
                            type="text"
                            placeholder="JOHN DOE"
                            value={cardName}
                            onChange={(e) =>
                              setCardName(e.target.value.toUpperCase())
                            }
                            className="bg-white border-gray-300 text-blue-900"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry" className="text-blue-900">
                              Expiry Date
                            </Label>
                            <Input
                              id="cardExpiry"
                              type="text"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) =>
                                setCardExpiry(formatExpiry(e.target.value))
                              }
                              maxLength={5}
                              className="bg-white border-gray-300 text-blue-900"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cardCvv" className="text-blue-900">
                              CVV
                            </Label>
                            <Input
                              id="cardCvv"
                              type="text"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) =>
                                setCardCvv(
                                  e.target.value.replace(/\D/g, '').slice(0, 3)
                                )
                              }
                              maxLength={3}
                              className="bg-white border-gray-300 text-blue-900"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-gray-100 rounded border border-gray-300">
                          <Lock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-blue-700/80">
                            Your payment information is encrypted and secure. We
                            don't store your card details.
                          </p>
                        </div>
                      </div>

                      {paymentError && (
                        <div className="flex items-center gap-2 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-red-600 text-sm">{paymentError}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={
                          isProcessing ||
                          !cardNumber ||
                          !cardName ||
                          !cardExpiry ||
                          !cardCvv
                        }
                      >
                        {isProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Pay Securely
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Security Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>PCI DSS Compliant</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-blue-800">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-blue-900 font-bold mb-1 text-sm md:text-base">
                    {bookingData.room}
                  </h3>
                  <p className="text-blue-600 text-xs md:text-sm">
                    {bookingData.bedType === 'single' ? 'Single' : 'Double'} Bed
                    & Breakfast
                  </p>
                </div>

                <Separator className="bg-gray-300" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="text-blue-900">
                      {new Date(bookingData.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="text-blue-900">
                      {new Date(bookingData.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="text-blue-900">{bookingData.nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms:</span>
                    <span className="text-blue-900">
                      {bookingData.numberOfRooms}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Guests:</span>
                    <span className="text-blue-900">
                      {bookingData.totalGuests}
                    </span>
                  </div>
                </div>

                <Separator className="bg-gray-300" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest:</span>
                    <span className="text-blue-900">
                      {bookingData.guest.firstName}{' '}
                      {bookingData.guest.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-blue-900 text-xs">
                      {bookingData.guest.email}
                    </span>
                  </div>
                </div>

                <Separator className="bg-gray-300" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {bookingData.currency === 'KES' ? 'KES' : '$'}
                      {bookingData.pricePerNight.toLocaleString()} ×{' '}
                      {bookingData.nights} × {bookingData.numberOfRooms}
                    </span>
                    <span className="text-blue-900 font-medium">
                      {bookingData.currency === 'KES' ? 'KES' : '$'}
                      {bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg md:text-xl font-bold pt-2 border-t border-gray-300">
                    <span className="text-blue-900">Total Amount:</span>
                    <span className="text-blue-700">
                      {bookingData.currency === 'KES' ? 'KES' : '$'}
                      {bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-3 bg-green-100 border border-green-300 rounded">
                    <p className="text-xs text-green-800">
                      ✓ Free cancellation up to 48 hours before check-in
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>

       {/* M-Pesa Payment Modal */}
      <Dialog open={showMpesaModal} onOpenChange={setShowMpesaModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              Complete M-Pesa Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Send the exact amount to either of these options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Amount to Pay */}
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
              <p className="text-sm text-green-700 mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-green-800">
                KES {bookingData?.totalPrice.toLocaleString()}
              </p>
            </div>

            {/* Till Number */}
            <div className="space-y-2">
              <Label className="text-blue-900 font-semibold">Option 1: Till Number</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Lipa Na M-Pesa</p>
                  <p className="text-2xl font-bold text-blue-900">431307</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyToClipboard('431307', 'till')}
                >
                  {copiedTill ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Paybill */}
            <div className="space-y-3">
              <Label className="text-blue-900 font-semibold">Option 2: Paybill</Label>
              
              <div>
                <p className="text-xs text-gray-600 mb-1">Paybill Number</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <p className="text-xl font-bold text-blue-900">522533</p>
                    <p className="text-xs text-gray-600">KCB Paybill</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard('522533', 'paybill')}
                  >
                    {copiedPaybill ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Account Number</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <p className="text-xl font-bold text-blue-900">126075</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard('126075', 'account')}
                  >
                    {copiedAccount ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* M-Pesa Code Input */}
            <form onSubmit={handleMpesaCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesaCode" className="text-blue-900 font-semibold">
                  Enter M-Pesa Confirmation Code
                </Label>
                <Input
                  id="mpesaCode"
                  type="text"
                  placeholder="e.g., RK12ABC34D"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  className="bg-white border-gray-300 text-blue-900 text-lg font-mono"
                  required
                />
                <p className="text-xs text-gray-600">
                  You'll receive this code via SMS after completing the payment
                </p>
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="text-red-600 text-xs">{paymentError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowMpesaModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isProcessing || !mpesaCode}
                >
                  {isProcessing ? (
                    <>Verifying...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Help Text */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Please ensure you send the exact amount shown above. 
                Your booking will be confirmed once we verify your payment.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  </main>
);
}