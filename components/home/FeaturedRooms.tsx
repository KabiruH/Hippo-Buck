import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Tv, Coffee, Waves, TreePine } from 'lucide-react';

const rooms = [
  {
    id: 1,
    name: 'Standard Room',
    description: 'Comfortable accommodation with essential amenities',
    priceKES: 'KES 3,000 - 3,500',
    priceUSD: 'USD 40 - 45',
    image: '/1a.jpg',
    amenities: ['Free WiFi', 'Smart TV', 'Coffee Maker', 'Bed & Breakfast'],
    beds: ['Single Bed', 'Double Bed'],
  },
  {
    id: 2,
    name: 'Superior (Pool View)',
    description: 'Stunning pool views with premium comfort',
    priceKES: 'KES 5,000 - 5,500',
    priceUSD: 'USD 55 - 65',
    image: '/8a.jpg',
    amenities: ['Free WiFi', 'Smart TV', 'Pool View', 'Bed & Breakfast'],
    beds: ['Single Bed', 'Double Bed'],
  },
  {
    id: 3,
    name: 'Superior (Garden View)',
    description: 'Serene garden views with luxury amenities',
    priceKES: 'KES 6,500 - 7,500',
    priceUSD: 'USD 75 - 110',
    image: '/3.jpg',
    amenities: ['Free WiFi', 'Smart TV', 'Garden View', 'Bed & Breakfast'],
    beds: ['Single Bed', 'Double Bed'],
  },
];

const amenityIcons = {
  'Free WiFi': Wifi,
  'Smart TV': Tv,
  'Coffee Maker': Coffee,
  'Pool View': Waves,
  'Garden View': TreePine,
  'Bed & Breakfast': Coffee,
};

export default function FeaturedRooms() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-blue-600 text-sm tracking-widest uppercase mb-2">
            Our Accommodations
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured <span className="text-blue-600">Rooms & Suites</span>
          </h2>
          <p className="text-gray-600">
            Discover our carefully curated collection of luxurious rooms
            designed for your ultimate comfort
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="bg-white border-gray-200 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded">
                  <span className="text-xs font-semibold block">{room.priceKES}</span>
                  <span className="text-xs block opacity-90">{room.priceUSD}</span>
                  <span className="text-xs block mt-1">per night</span>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  <p className="text-gray-600">{room.description}</p>
                  <p className="text-sm text-blue-600 mt-2">
                    Available: {room.beds.join(' or ')}
                  </p>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                  {room.amenities.slice(0, 4).map((amenity, index) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                    return Icon ? (
                      <div
                        key={index}
                        className="text-blue-600"
                        title={amenity}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    ) : null;
                  })}
                </div>

                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/booking?room=${room.id}`}>BOOK NOW</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <Link href="/rooms">VIEW ALL ROOMS</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}