import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define route configurations
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/booking',
  '/booking-confirmation',
  '/booking-lookup',
  '/booking-status',
  '/contact',
  '/payment',
  '/rooms',
  '/login',
  '/signup',
];

const ADMIN_ROUTES = [
  '/bookings',
  '/dashboard',
  '/pending-users',
  '/rooms-control',
  '/users',
];

// Routes that don't need any middleware processing
const IGNORED_ROUTES = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/static',
];

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for ignored routes (API, static files, etc.)
  if (IGNORED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Check if route is admin-only
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    // If user is already logged in and tries to access login/signup, redirect to dashboard
    if ((pathname === '/login' || pathname === '/signup') && token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
        const { payload } = await jwtVerify(token, secret);
        
        if (payload && payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Invalid token, allow access to login/signup
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // For protected routes, verify token
  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);

    // Check if user has required role for admin routes
    if (isAdminRoute) {
      if (payload.role !== 'ADMIN') {
        // User is not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Token is valid, allow access
    const response = NextResponse.next();
    
    // Add user info to headers (optional - useful for API routes)
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-user-email', payload.email as string);
    response.headers.set('x-user-role', payload.role as string);
    
    return response;
  } catch (error) {
    // Token is invalid or expired
    console.error('Middleware JWT verification failed:', error);
    
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    
    // Add redirect parameter to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(loginUrl);
  }
}