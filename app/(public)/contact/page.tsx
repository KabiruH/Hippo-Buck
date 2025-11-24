// app/(public-pages)/contact/page.tsx
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black pt-24">
      {/* Hero Section */}
      <section className="relative py-20 bg-linear-to-br from-amber-900/20 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get In <span className="text-amber-500">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us for reservations, inquiries, or any questions about your stay.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Address */}
            <Card className="bg-black border-zinc-800 hover:border-amber-500 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-400 text-sm">
                  Homa Bay Town<br />
                  Lake Victoria, Homa Bay County<br />
                  Kenya
                </p>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="bg-black border-zinc-800 hover:border-amber-500 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Call Us</h3>
                <a href="tel:+254700000000" className="text-gray-400 hover:text-amber-500 transition-colors text-sm block">
                  +254 700 000 000
                </a>
                <a href="tel:+254722000000" className="text-gray-400 hover:text-amber-500 transition-colors text-sm block">
                  +254 722 000 000
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-black border-zinc-800 hover:border-amber-500 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Email Us</h3>
                <a href="mailto:info@hotelhippobuck.com" className="text-gray-400 hover:text-amber-500 transition-colors text-sm block">
                  info@hotelhippobuck.com
                </a>
                <a href="mailto:reservations@hotelhippobuck.com" className="text-gray-400 hover:text-amber-500 transition-colors text-sm block">
                  reservations@hotelhippobuck.com
                </a>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="bg-black border-zinc-800 hover:border-amber-500 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">Business Hours</h3>
                <p className="text-gray-400 text-sm">
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
              <h2 className="text-3xl font-bold text-white mb-4">
                Send Us A <span className="text-amber-500">Message</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Booking Inquiry"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg font-semibold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Find <span className="text-amber-500">Us</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Located on the shores of Lake Victoria in beautiful Homa Bay Town. Easily accessible from the main highway.
              </p>

              {/* Map Placeholder */}
              <div className="rounded-xl overflow-hidden border border-zinc-800 mb-8">
                <div className="bg-zinc-900 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Map integration coming soon</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Homa Bay Town, Lake Victoria
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <Card className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black mb-4">
                    Why Choose Hotel Hippo Buck?
                  </h3>
                  <ul className="space-y-3 text-black">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Prime lakeside location with stunning sunset views</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Fresh tilapia and local cuisine restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Comfortable rooms with modern amenities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm">Warm Kenyan hospitality and personalized service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
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
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready To Book Your <span className="text-amber-500">Stay?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience the magic of Lake Victoria at Hotel Hippo Buck
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg"
            >
              <a href="/booking">Book Now</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white px-8 py-6 text-lg"
            >
              <a href="/rooms">View Rooms</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}