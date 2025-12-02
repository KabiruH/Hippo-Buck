import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, Heart, Users, Waves } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Warm Hospitality',
    description:
      'Like the graceful hippopotamus in water, we provide comfort and care with genuine warmth and attention to every guest.',
  },
  {
    icon: Award,
    title: 'Excellence in Service',
    description:
      'We maintain the highest standards in everything we do, from our fresh cuisine to our immaculate rooms and attentive staff.',
  },
  {
    icon: Waves,
    title: 'Lakeside Serenity',
    description:
      'Perfectly positioned to showcase Lake Victoria\'s natural beauty, offering breathtaking sunsets and peaceful surroundings.',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description:
      'We source locally, support our community, and bring you authentic experiences including fresh Tilapia from Lake Victoria.',
  },
];

const timeline = [
  {
    year: 'Our Foundation',
    title: 'A Vision Born',
    description:
      'Hotel Hippo Buck was established with a vision to create a serene lakeside retreat in the heart of Homa Bay Town.',
  },
  {
    year: 'Our Name',
    title: 'The Hippo Spirit',
    description:
      'Named after the majestic hippopotamus, known for its strength and grace in water, embodying our commitment to excellence.',
  },
  {
    year: 'Today',
    title: 'Your Home by the Lake',
    description:
      'We continue to welcome guests from around the world, offering comfort, fresh cuisine, and unforgettable Lake Victoria sunsets.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/d.jpg"
            alt="Hotel Hippo Buck - About Us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-blue-400 text-sm tracking-widest uppercase">
              Welcome to Our Story
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide">
              About <span className="text-blue-400">Hotel Hippo Buck</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your serene lakeside retreat where strength meets grace
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-blue-600 text-sm tracking-widest uppercase">
                  Our Story
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  A Unique Blend of{' '}
                  <span className="text-blue-600">Comfort & Natural Beauty</span>
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Welcome to Hotel Hippo Buck, your serene hotel retreat at the heart
                of Homa Bay Town! Situated in Homa Bay Town, our hotel offers a
                unique blend of comfort and natural beauty.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Named after the majestic hippopotamus, known for its strength and
                grace in water, our hotel embodies these qualities, providing a
                strong foundation of excellent service and graceful hospitality.
              </p>
              <p className="text-gray-700 leading-relaxed">
                At Hotel Hippo Buck, you can wake up to the breathtaking sunsets
                and gentle breezes of Lake Victoria. Savor our fresh meals,
                prepared with locally sourced ingredients, including our catch of
                the day – the freshest Tilapia for your lunch or dinner.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Whether you're looking for a peaceful getaway, a romantic escape,
                or a family vacation, Hotel Hippo Buck is the perfect destination.
                Come, experience the magic of Homa Bay Town and the warmth of our
                hospitality. We look forward to welcoming you!
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[600px] rounded-lg overflow-hidden">
              <Image
                src="/e.jpg"
                alt="Hotel Hippo Buck Interior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-blue-600 text-sm tracking-widest uppercase mb-2">
              What Drives Us
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Core Values</span>
            </h2>
            <p className="text-gray-600">
              The principles that guide us in creating exceptional experiences for
              every guest
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white border border-gray-200 rounded-lg hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm tracking-widest uppercase mb-2">
              Our Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              The <span className="text-blue-600">Hippo Buck Story</span>
            </h2>
          </div>

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="relative pl-8 border-l-2 border-blue-500/30"
              >
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-white" />
                <div className="space-y-2">
                  <p className="text-blue-600 text-sm font-semibold tracking-wider uppercase">
                    {item.year}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lake Victoria Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative h-[500px] rounded-lg overflow-hidden order-2 lg:order-1">
              <Image
                src="/g.jpg"
                alt="Lake Victoria Sunset"
                fill
                className="object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-2">
                <p className="text-blue-600 text-sm tracking-widest uppercase">
                  Our Location
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Nestled by{' '}
                  <span className="text-blue-600">Lake Victoria</span>
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Homa Bay Town sits on the shores of Lake Victoria, Africa's largest
                lake and the world's second-largest freshwater lake. This prime
                location offers our guests unparalleled natural beauty.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Watch spectacular sunsets paint the sky in brilliant colors as the
                sun dips below the lake's horizon. Feel the gentle breezes that
                cool the evening air. Experience the tranquility that comes from
                being surrounded by such natural magnificence.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our proximity to the lake also means the freshest Tilapia on your
                plate – caught daily and prepared with local expertise that
                generations have perfected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Experience{' '}
            <span className="text-blue-600">Hotel Hippo Buck?</span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            Join us for an unforgettable stay where Lake Victoria's beauty meets
            warm Kenyan hospitality. Book your room today and discover why our
            guests return again and again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <Link href="/booking">BOOK YOUR STAY</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8"
            >
              <Link href="/rooms">VIEW ROOMS</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}