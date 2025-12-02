import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomeSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-blue-600 text-sm tracking-widest uppercase">
                Welcome to Hotel Hippo Buck
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Your Serene Lakeside Retreat in{' '}
                <span className="text-blue-600">Homa Bay Town</span>
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              Situated in the heart of Homa Bay Town, Hotel Hippo Buck offers a 
              unique blend of comfort and natural beauty. Named after the majestic 
              hippopotamus, known for its strength and grace in water, our hotel 
              embodies these qualities, providing a strong foundation of excellent 
              service and graceful hospitality.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Wake up to breathtaking sunsets and gentle breezes of Lake Victoria. 
              Savor our fresh meals, prepared with locally sourced ingredients, 
              including our catch of the day – the freshest Tilapia for your lunch 
              or dinner. Experience the unique blend of comfort and culinary delights 
              at Hotel Hippo Buck.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you're looking for a peaceful getaway, a romantic escape, or 
              a family vacation, Hotel Hippo Buck is the perfect destination. Come, 
              experience the magic of Homa Bay Town and the warmth of our hospitality.
            </p>
            <div className="pt-4">
              <Button
                asChild
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Link href="/about">DISCOVER OUR STORY</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            <Image
              src="/j.jpg"
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