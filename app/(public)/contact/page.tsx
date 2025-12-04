// app/(public-pages)/contact/page.tsx
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/f.jpg"
            alt="Hotel Hippo Buck Contact"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              Get In <span className="text-blue-400">Touch</span>
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto">
              We'd love to hear from you. Reach out to us for reservations, inquiries, or any questions about your stay.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Address */}
            <Card className="bg-white border-gray-200 shadow-lg transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-600 text-sm">
                  Homa Bay Town<br />
                  Lake Victoria, Homa Bay County<br />
                  Kenya
                </p>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="bg-white border-gray-200 shadow-lg transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Call Us</h3>
                <a href="tel:+254723262000" className="text-gray-700 hover:text-blue-600 transition-colors text-sm block">
                  +254 723 262 000 
                </a>
                <a href="tel:+254733708465" className="text-gray-700 hover:text-blue-600 transition-colors text-sm block">
                  +254 733 708 465
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-white border-gray-200 shadow-lg transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Email Us</h3>
                <a href="mailto:info@hippobuck.com" className="text-gray-700 hover:text-blue-600 transition-colors text-sm block">
                  info@hippobuck.com
                </a>
                <a href="mailto:info@hippobuck.com" className="text-gray-700 hover:text-blue-600 transition-colors text-sm block">
                  info@hippobuck.com
                </a>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="bg-white border-gray-200 shadow-lg transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Business Hours</h3>
                <p className="text-gray-600 text-sm">
                  Reception: 24/7<br />
                  Restaurant: 6am - 11pm<br />
                  Bar: 10am - Midnight
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form & Map Section */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Send Us A <span className="text-blue-600">Message</span>
              </h2>
              <p className="text-gray-700 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-900">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-900">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-900">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Booking Inquiry"
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-900">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find <span className="text-blue-600">Us</span>
              </h2>
              <p className="text-gray-700 mb-8">
                Located on the shores of Lake Victoria in beautiful Homa Bay Town. Easily accessible from the main highway.
              </p>

              {/* Map Placeholder */}
              <div className="rounded-xl overflow-hidden border border-gray-300 mb-8 shadow-md">
                <div className="bg-gray-100 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-700 text-sm">Map integration coming soon</p>
                    <p className="text-gray-600 text-xs mt-2">
                      Homa Bay Town, Lake Victoria
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <Card className="bg-linear-to-br from-blue-50 to-white border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Why Choose Hotel Hippo Buck?
                  </h3>
                  <ul className="space-y-3 text-gray-900">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Prime lakeside location with stunning sunset views</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Fresh tilapia and local cuisine restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Comfortable rooms with modern amenities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Warm Kenyan hospitality and personalized service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Easy access to Lake Victoria attractions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready To Book Your <span className="text-blue-600">Stay?</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Experience the magic of Lake Victoria at Hotel Hippo Buck
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              <a href="/booking">Book Now</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-6 text-lg"
            >
              <a href="/rooms">View Rooms</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}