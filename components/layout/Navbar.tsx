// components/Navbar.tsx
'use client'; // Required for the mobile menu state

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'ROOMS', href: '/rooms' },
    // { name: 'AMENITIES', href: '/amenities' },
    // { name: 'GALLERY', href: '/gallery' },
    { name: 'CONTACT', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-amber-900/20 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-3">
            <div className="relative w-12 h-12 md:w-14 md:h-14">
              <Image
                src="/logo.png"
                alt="Hotel Hippo Buck Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-lg md:text-xl font-bold">
              <span className="text-white">HOTEL </span>
              <span className="text-amber-500">HIPPO BUCK</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-amber-500 transition-colors duration-300 text-sm font-medium tracking-wider"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side - Phone and Buttons (Desktop) */}
          <div className="hidden lg:flex items-center space-x-6">
            <a 
              href="tel:+254700000000"
              className="flex items-center text-white hover:text-amber-500 transition-colors duration-300"
            >
              <Phone className="w-5 h-5 mr-2" />
            </a>
            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
            >
              <Link href="/booking">RESERVATION</Link>
            </Button>
            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
            >
              <Link href="/login">Staff Login</Link>
            </Button>
          </div>

          {/* Mobile menu toggle button */}
          <button 
            className="lg:hidden text-white hover:text-amber-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-zinc-800">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-white hover:text-amber-500 hover:bg-zinc-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {/* Mobile Action Buttons */}
            <div className="pt-4 space-y-3">
              <Button
                asChild
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href="/booking">RESERVATION</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href="/login">Staff Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}