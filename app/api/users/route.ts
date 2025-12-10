import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser, requireRole } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticateUser(request);
    
    if (error) {
      return error;
    }
    
    // Check if user has required role (ADMIN or MANAGER)
    const roleError = requireRole(user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (roleError) {
      return roleError;
    }
    
    // Get all users (excluding passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(
      { users },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}