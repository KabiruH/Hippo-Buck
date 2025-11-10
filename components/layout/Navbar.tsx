'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Phone, Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'ROOMS', href: '/rooms' },
    { name: 'AMENITIES', href: '/amenities' },
    { name: 'GALLERY', href: '/gallery' },
    { name: 'CONTACT', href: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session/cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setIsProfileOpen(false);
      
      // Redirect to home page
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-amber-900/20 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={user ? '/admin/dashboard' : '/'} className="shrink-0 flex items-center gap-3">
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

          {/* Conditional Navigation - Show different content based on login status */}
          {user ? (
            // Logged In User Navigation
            <>
              {/* Desktop - Logged In */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors duration-300 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors duration-300"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-zinc-800 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button - Logged In */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white hover:text-amber-500 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          ) : (
            // Guest Navigation
            <>
              {/* Desktop Navigation - Guest */}
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

              {/* Right side - Phone and Buttons - Guest */}
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

              {/* Mobile menu button - Guest */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white hover:text-amber-500 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-black/15 backdrop-blur-md border-t border-amber-900/20">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {user ? (
              // Mobile - Logged In
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-amber-900/20">
                  <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <p className="text-xs text-amber-500">{user.role}</p>
                  </div>
                </div>

                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 text-white hover:text-amber-500 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>

                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 text-white hover:text-amber-500 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 text-white hover:text-amber-500 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>

                <div className="pt-4 border-t border-amber-900/20">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors py-2 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              // Mobile - Guest
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-white hover:text-amber-500 transition-colors duration-300 text-sm font-medium tracking-wider py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-4 border-t border-amber-900/20">
                  <a
                    href="tel:+254700000000"
                    className="flex items-center text-white hover:text-amber-500 transition-colors duration-300"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="text-sm">+254 700 000 000</span>
                  </a>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
}