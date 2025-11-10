// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from './auth';
import { UserRole } from './constant';

/**
 * Middleware to verify JWT token and attach user to request
 * Checks both Authorization header and cookies for token
 */
export async function authenticateUser(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
  // First, try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  let token = extractToken(authHeader);

  // If no token in Authorization header, check cookies
  if (!token) {
    token = request.cookies.get('token')?.value || null;
  }

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(
  user: JWTPayload,
  allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(user: JWTPayload): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
}