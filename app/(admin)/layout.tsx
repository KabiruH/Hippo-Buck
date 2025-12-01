// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Check if user has access to admin routes
      const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF'];
      if (!allowedRoles.includes(user.role)) {
        router.push('/login');
        return;
      }

      // Additional role-based route protection
      if (pathname.startsWith('/admin/dashboard') && user.role !== 'ADMIN') {
        router.push('/admin/bookings');
        return;
      }

      if (pathname.startsWith('/admin/users') && user.role !== 'ADMIN') {
        router.push('/admin/bookings');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-black">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-zinc-800 bg-black/95 backdrop-blur supports-backdrop-filter:bg-black/60 px-6">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <Separator orientation="vertical" className="h-6 bg-zinc-800" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white">
                {getPageTitle(pathname)}
              </h1>
            </div>
          </header>

          {/* Main Content */}
              <SessionProvider>
          <main className="flex-1">{children}</main>
          </SessionProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/admin/users')) return 'User Management';
  if (pathname.startsWith('/admin/bookings')) return 'Bookings';
  if (pathname.startsWith('/admin/rooms')) return 'Rooms';
  return 'Hotel Hippo Buck';
}