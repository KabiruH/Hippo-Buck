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

    // Check if requester is admin or manager
    const roleError = requireRole(user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (roleError) {
      return roleError;
    }

    // Get all pending users (isActive = false)
    const pendingUsers = await prisma.user.findMany({
      where: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}