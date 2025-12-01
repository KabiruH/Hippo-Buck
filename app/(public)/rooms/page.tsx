import RoomGallery from '@/components/rooms/Room-gallery';
import RoomDetails from '@/components/rooms/Room-details';
import HotelPolicies from '@/components/rooms/Hotel-policies';
import Image from 'next/image';
import { roomsData } from '@/lib/rooms-data';

export default function RoomsPage() { 
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/3.jpg"
            alt="Hotel Hippo Buck Rooms"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay → slightly softer for light theme */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
            <p className="text-blue-600 text-xs md:text-sm tracking-widest uppercase">
              Choose Your Perfect Stay
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              Our <span className="text-blue-400">Rooms & Suites</span>
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto">
              Comfortable accommodations with Lake Victoria views
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-12 md:py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 md:space-y-24">
            {roomsData.map((room, index) => (
              <div
                key={room.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 lg:gap-12`}
              >
                {/* Image Gallery Component */}
                <div className="lg:w-1/2 shadow-lg rounded-xl bg-white">
                  <RoomGallery images={room.images} roomName={room.name} />
                </div>

                {/* Room Details Component */}
                <div className="lg:w-1/2">
                  <RoomDetails room={room} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotel Policies Component */}
      <HotelPolicies />
    </main>
  );
}
