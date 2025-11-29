// components/app-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DoorOpen,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[]; // Roles that can access this item
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: Calendar,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    title: 'Rooms',
    href: '/rooms-control',
    icon: DoorOpen,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { state } = useSidebar();

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  // Filter nav items based on user role
  const filteredNavItems = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">HB</span>
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-gray-900 font-bold text-lg truncate">
                Hotel Hippo Buck
              </span>
              <span className="text-xs text-gray-500 truncate">Management System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* User Info */}
        {user && state === 'expanded' && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-semibold">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-gray-900 font-medium text-sm truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-gray-200 mb-4" />

        {/* Navigation */}
        <SidebarMenu>
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`
                          ${
                            isActive
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Link href={item.href}>
                          <Icon className="w-5 h-5" />
                          {state === 'expanded' && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {state === 'collapsed' && (
                      <TooltipContent side="right" className="bg-white border-gray-200">
                        <p>{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    {state === 'expanded' && <span>Logout</span>}
                  </SidebarMenuButton>
                </TooltipTrigger>
                {state === 'collapsed' && (
                  <TooltipContent side="right" className="bg-white border-gray-200">
                    <p>Logout</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}