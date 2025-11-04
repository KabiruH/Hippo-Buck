'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, Bed, CreditCard, Plus, Minus, DoorOpen } from 'lucide-react';
import { roomsData } from '@/lib/rooms-data';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomIdFromUrl = searchParams.get('room');

  const [selectedRoom, setSelectedRoom] = useState(roomIdFromUrl || '');
  const [region, setRegion] = useState('eastAfrican');
  const [bedType, setBedType] = useState('single');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [adultsPerRoom, setAdultsPerRoom] = useState(1);
  const [childrenPerRoom, setChildrenPerRoom] = useState(0);
  const [nights, setNights] = useState(0);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Guest Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Calculate nights and total price
  useEffect(() => {
    if (checkIn && checkOut && selectedRoom) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nightCount = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nightCount > 0) {
        const room = roomsData.find((r) => r.id === selectedRoom);
        if (room) {
          const price =
            room.pricing[region as keyof typeof room.pricing][
              bedType as keyof typeof room.pricing.eastAfrican
            ];
          setPricePerNight(price);
          setNights(nightCount);
          setTotalPrice(price * nightCount * numberOfRooms);
        }
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    }
  }, [checkIn, checkOut, selectedRoom, region, bedType, numberOfRooms]);

  const selectedRoomData = roomsData.find((r) => r.id === selectedRoom);
  const currency = region === 'eastAfrican' ? 'KES' : 'USD';
  const currencySymbol = region === 'eastAfrican' ? 'KES ' : '$';

  const totalGuests = (adultsPerRoom + childrenPerRoom) * numberOfRooms;
  const maxGuestsPerRoom = selectedRoomData?.features.maxGuests || 2;
  const totalGuestsPerRoom = adultsPerRoom + childrenPerRoom;
  const isGuestCapacityValid = totalGuestsPerRoom <= maxGuestsPerRoom;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isGuestCapacityValid) {
      alert(`Maximum ${maxGuestsPerRoom} guests per room allowed!`);
      return;
    }

    // Prepare booking data
    const bookingData = {
      room: selectedRoomData?.name,
      roomId: selectedRoom,
      region,
      bedType,
      checkIn,
      checkOut,
      numberOfRooms,
      adultsPerRoom,
      childrenPerRoom,
      totalGuests,
      nights,
      pricePerNight,
      totalPrice,
      currency,
      guest: {
        firstName,
        lastName,
        email,
        phone,
      },
      specialRequests,
    };

    console.log('Booking data:', bookingData);
    
    // Store in sessionStorage for payment page
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to payment page
    router.push('/payment');
  };

  const incrementRooms = () => {
    if (numberOfRooms < 10) setNumberOfRooms(numberOfRooms + 1);
  };

  const decrementRooms = () => {
    if (numberOfRooms > 1) setNumberOfRooms(numberOfRooms - 1);
  };

  const incrementAdults = () => {
    if (adultsPerRoom + childrenPerRoom < maxGuestsPerRoom) {
      setAdultsPerRoom(adultsPerRoom + 1);
    }
  };

  const decrementAdults = () => {
    if (adultsPerRoom > 1) setAdultsPerRoom(adultsPerRoom - 1);
  };

  const incrementChildren = () => {
    if (adultsPerRoom + childrenPerRoom < maxGuestsPerRoom) {
      setChildrenPerRoom(childrenPerRoom + 1);
    }
  };

  const decrementChildren = () => {
    if (childrenPerRoom > 0) setChildrenPerRoom(childrenPerRoom - 1);
  };

  return (
    <main className="min-h-screen bg-black">

      {/* Hero Section - Compact for Mobile */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/1.jpg"
            alt="Book Your Stay"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-2 md:space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              Book Your <span className="text-amber-500">Stay</span>
            </h1>
            <p className="text-sm md:text-xl text-white/90">
              Reserve your room at Hotel Hippo Buck
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form Section - Mobile First */}
      <section className="py-8 md:py-16 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Booking Form - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <Card className="bg-black border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-white">
                    Reservation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Room Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="room" className="text-white text-sm md:text-base">
                        Select Room Type
                      </Label>
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                          <SelectValue placeholder="Choose a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomsData.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Region and Bed Type - Side by Side */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-white text-sm md:text-base">
                          Guest Region
                        </Label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eastAfrican">
                              East African (KES)
                            </SelectItem>
                            <SelectItem value="nonEastAfrican">
                              Non-East African (USD)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bedType" className="text-white text-sm md:text-base">
                          Bed Type
                        </Label>
                        <Select value={bedType} onValueChange={setBedType}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Bed</SelectItem>
                            <SelectItem value="double">Double Bed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Number of Rooms */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm md:text-base">
                        Number of Rooms
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={decrementRooms}
                          disabled={numberOfRooms <= 1}
                          variant="outline"
                          size="icon"
                          className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <DoorOpen className="w-5 h-5 text-amber-500" />
                          <span className="text-white text-lg font-semibold">
                            {numberOfRooms} {numberOfRooms === 1 ? 'Room' : 'Rooms'}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={incrementRooms}
                          disabled={numberOfRooms >= 10}
                          variant="outline"
                          size="icon"
                          className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Guest Capacity Per Room */}
                    <div className="space-y-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm md:text-base">
                          Guests Per Room
                        </Label>
                        {selectedRoomData && (
                          <span className="text-xs text-gray-400">
                            Max {maxGuestsPerRoom} per room
                          </span>
                        )}
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Adults (18+)</span>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            onClick={decrementAdults}
                            disabled={adultsPerRoom <= 1}
                            variant="outline"
                            size="icon"
                            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 h-8 w-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white w-8 text-center font-semibold">
                            {adultsPerRoom}
                          </span>
                          <Button
                            type="button"
                            onClick={incrementAdults}
                            disabled={totalGuestsPerRoom >= maxGuestsPerRoom}
                            variant="outline"
                            size="icon"
                            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 h-8 w-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Children (0-17)</span>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            onClick={decrementChildren}
                            disabled={childrenPerRoom <= 0}
                            variant="outline"
                            size="icon"
                            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 h-8 w-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white w-8 text-center font-semibold">
                            {childrenPerRoom}
                          </span>
                          <Button
                            type="button"
                            onClick={incrementChildren}
                            disabled={totalGuestsPerRoom >= maxGuestsPerRoom}
                            variant="outline"
                            size="icon"
                            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 h-8 w-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {!isGuestCapacityValid && (
                        <p className="text-red-500 text-xs">
                          Maximum {maxGuestsPerRoom} guests per room exceeded!
                        </p>
                      )}

                      <div className="pt-2 border-t border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Total Guests:</span>
                          <span className="text-amber-500 font-semibold">
                            {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'} across {numberOfRooms} {numberOfRooms === 1 ? 'room' : 'rooms'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Check-in and Check-out */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn" className="text-white text-sm md:text-base">
                          Check-in Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                          <Input
                            id="checkIn"
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="pl-10 bg-zinc-900 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="checkOut" className="text-white text-sm md:text-base">
                          Check-out Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                          <Input
                            id="checkOut"
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            className="pl-10 bg-zinc-900 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div className="pt-4 border-t border-zinc-800">
                      <h3 className="text-white font-bold mb-4 text-base md:text-lg">
                        Primary Guest Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-white text-sm">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="bg-zinc-900 border-zinc-700 text-white"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-white text-sm">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="bg-zinc-900 border-zinc-700 text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white text-sm">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-white text-sm">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254"
                            className="bg-zinc-900 border-zinc-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="requests" className="text-white text-sm">
                            Special Requests (Optional)
                          </Label>
                          <textarea
                            id="requests"
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            rows={3}
                            placeholder="Any special requests or requirements..."
                            className="w-full bg-zinc-900 border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-6"
                      disabled={!selectedRoom || !checkIn || !checkOut || nights <= 0 || !isGuestCapacityValid}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      PROCEED TO PAYMENT
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary - Stacks below form on mobile */}
            <div className="lg:col-span-1">
              <Card className="bg-black border-amber-500/30 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl text-white">
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRoomData && (
                    <>
                      {/* Room Image */}
                      <div className="relative h-32 md:h-40 rounded overflow-hidden">
                        <Image
                          src={selectedRoomData.images[0]}
                          alt={selectedRoomData.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Room Details */}
                      <div>
                        <h3 className="text-white font-bold mb-1 text-sm md:text-base">
                          {selectedRoomData.name}
                        </h3>
                        <p className="text-amber-500 text-xs md:text-sm">
                          {bedType === 'single' ? 'Single' : 'Double'} Bed & Breakfast
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-800 pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Rooms:</span>
                          <span className="text-white">{numberOfRooms}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Guests:</span>
                          <span className="text-white">{totalGuests}</span>
                        </div>
                        {checkIn && checkOut && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Check-in:</span>
                              <span className="text-white">
                                {new Date(checkIn).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Check-out:</span>
                              <span className="text-white">
                                {new Date(checkOut).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Nights:</span>
                              <span className="text-white">{nights}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Price Breakdown */}
                      {nights > 0 && (
                        <div className="border-t border-zinc-800 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {currencySymbol}
                              {pricePerNight.toLocaleString()} × {nights} night
                              {nights > 1 ? 's' : ''} × {numberOfRooms} room{numberOfRooms > 1 ? 's' : ''}
                            </span>
                            <span className="text-white">
                              {currencySymbol}
                              {totalPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-base md:text-lg font-bold pt-2 border-t border-zinc-800">
                            <span className="text-white">Total:</span>
                            <span className="text-amber-500">
                              {currencySymbol}
                              {totalPrice.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 pt-2">
                            *Taxes included. Breakfast included in all rates.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {!selectedRoomData && (
                    <p className="text-gray-400 text-center py-8 text-sm">
                      Select a room to see pricing details
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}