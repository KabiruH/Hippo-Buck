// components/ConditionalLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  // Show loading state to prevent flash
  if (isLoading) {
    return <>{children}</>;
  }

  // If user is logged in, don't show navbar and footer
  if (user) {
    return <>{children}</>;
  }

  // If user is not logged in, show navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}