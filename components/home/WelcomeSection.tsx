import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomeSection() {
  return (
    <section className="py-20 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-amber-500 text-sm tracking-widest uppercase">
                Welcome to Hotel Hippo Buck
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Your Serene Lakeside Retreat in{' '}
                <span className="text-amber-500">Homa Bay Town</span>
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              Situated in the heart of Homa Bay Town, Hotel Hippo Buck offers a 
              unique blend of comfort and natural beauty. Named after the majestic 
              hippopotamus, known for its strength and grace in water, our hotel 
              embodies these qualities, providing a strong foundation of excellent 
              service and graceful hospitality.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Wake up to breathtaking sunsets and gentle breezes of Lake Victoria. 
              Savor our fresh meals, prepared with locally sourced ingredients, 
              including our catch of the day – the freshest Tilapia for your lunch 
              or dinner. Experience the unique blend of comfort and culinary delights 
              at Hotel Hippo Buck.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you're looking for a peaceful getaway, a romantic escape, or 
              a family vacation, Hotel Hippo Buck is the perfect destination. Come, 
              experience the magic of Homa Bay Town and the warmth of our hospitality.
            </p>
            <div className="pt-4">
              <Button
                asChild
                variant="outline"
                className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
              >
                <Link href="/about">DISCOVER OUR STORY</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            <Image
              src="/2.jpg"
              alt="Hotel Hippo Buck - Lake Victoria View Homa Bay"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}