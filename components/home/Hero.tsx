'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/1.jpg"
          alt="Luxury Hotel"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide">
            <span className="text-white">HOTEL </span>
            <span className="text-blue-400">HIPPO BUCK</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
            YOUR SERENE LAKESIDE RETREAT IN THE HEART OF HOMA BAY TOWN
          </p>
          <p className="text-lg md:text-xl text-blue-300 font-medium tracking-wide">
            Experience Lake Victoria's Breathtaking Sunsets | Fresh Tilapia Cuisine | Warm Hospitality
          </p>
          <p className="text-white/80 text-base md:text-lg tracking-wider">
            HOMA BAY TOWN, LAKE VICTORIA, KENYA
          </p>
          <div className="pt-8">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg tracking-wider"
            >
              <Link href="/booking">BOOK YOUR STAY</Link>
            </Button>
          </div>
           <div className="pt-8">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg tracking-wider"
            >
              <Link href="/booking-lookup">Confirm Booking</Link>
            </Button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/80 hover:text-white transition-colors duration-300 group"
        >
          <span className="text-sm tracking-widest mb-2">DISCOVER MORE</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </div>
    </section>
  );
}