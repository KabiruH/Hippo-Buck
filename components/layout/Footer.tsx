// components/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-xl md:text-2xl font-bold">
              <span className="text-white">HOTEL </span>
              <span className="text-blue-600">HIPPO BUCK</span>            </div>
            <p className="text-gray-400 text-sm">
              Your serene lakeside retreat in Homa Bay Town. Experience the 
              magic of Lake Victoria with breathtaking sunsets, fresh Tilapia 
              cuisine, and warm hospitality.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/hippobuck"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              
              <a
                href="https://instagram.com/hippobuck"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              
              <a
                href="https://twitter.com/add hippobuck"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"                >
                  Rooms & Suites
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/amenities"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"                >
                  Amenities
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"                >
                  Gallery
                </Link>
              </li> */}
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Fresh Tilapia Restaurant</li>
              <li className="text-gray-400 text-sm">Lake Victoria Tours</li>
              <li className="text-gray-400 text-sm">Room Service</li>
              <li className="text-gray-400 text-sm">Airport Transfer</li>
              <li className="text-gray-400 text-sm">Event Hosting</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />                <span>Homa Bay Town, Lake Victoria, Homa Bay County, Kenya</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />                
                <a href="tel:+254733708465" className="hover:text-amber-500">
                  +254 733 708 465
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />                
                <a href="tel:+254723262000" className="hover:text-amber-500">
                  +254 723 262 000
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />                <a
                  href="mailto:info@hippobuck.com"
                  className="hover:text-blue-600"                >
                  info@hippobuck.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Hotel Hippo Buck. All rights reserved. | Homa Bay Town, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}