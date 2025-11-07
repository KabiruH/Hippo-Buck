import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Users, Check } from 'lucide-react';

interface RoomDetailsProps {
  room: {
    id: string;
    name: string;
    description: string;
    pricing: {
      eastAfrican: {
        single: number;
        double: number;
      };
      nonEastAfrican: {
        single: number;
        double: number;
      };
    };
    amenities: string[];
    features: {
      bedTypes: string[];
      maxGuests: number;
      roomSize: string;
      view?: string;
    };
  };
}

export default function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Room Header */}
      <div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
          {room.name}
        </h2>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          {room.description}
        </p>
      </div>

      {/* Pricing Card */}
      <Card className="bg-black border-amber-500/30">
        <CardContent className="p-4 md:p-6">
          <p className="text-amber-500 text-xs md:text-sm font-semibold mb-3 md:mb-4 uppercase tracking-wider">
            Room Rates (Per Night)
          </p>
          <div className="space-y-3 md:space-y-4">
            {/* East African Pricing */}
            <div>
              <p className="text-gray-400 text-xs md:text-sm mb-2">
                East Africans (KES)
              </p>
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-white">Single B&B:</span>
                <span className="text-amber-500 font-bold">
                  KES {room.pricing.eastAfrican.single.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-white">Double B&B:</span>
                <span className="text-amber-500 font-bold">
                  KES {room.pricing.eastAfrican.double.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Non-East African Pricing */}
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-gray-400 text-xs md:text-sm mb-2">
                Non-East Africans (USD)
              </p>
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-white">Single B&B:</span>
                <span className="text-amber-500 font-bold">
                  ${room.pricing.nonEastAfrican.single}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-white">Double B&B:</span>
                <span className="text-amber-500 font-bold">
                  ${room.pricing.nonEastAfrican.double}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Features */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="flex items-center gap-2 text-white">
          <Bed className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          <span className="text-xs md:text-sm">
            {room.features.bedTypes.join(' / ')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          <span className="text-xs md:text-sm">
            Up to {room.features.maxGuests} Guests
          </span>
        </div>
        {room.features.view && (
          <div className="flex items-center gap-2 text-white col-span-2">
            <Check className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            <span className="text-xs md:text-sm">{room.features.view}</span>
          </div>
        )}
      </div>

      {/* Amenities List */}
      <div>
        <h3 className="text-white font-bold mb-3 md:mb-4 text-base md:text-lg">
          Room Amenities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {room.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-300">
              <Check className="w-3 h-3 md:w-4 md:h-4 text-amber-500 shrink-0" />
              <span className="text-xs md:text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Button */}
      <Button
  asChild
  size="lg"
  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm md:text-base"
>
  <Link href={`/booking?room=${room.id}`}>BOOK THIS ROOM</Link>
</Button>
    </div>
  );
}