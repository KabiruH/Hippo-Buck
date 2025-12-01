// app/api/admin/users/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constant';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if requester is admin or manager
    if (decoded.role !== UserRole.ADMIN && decoded.role !== UserRole.MANAGER) {
      return NextResponse.json(
        { error: 'Only administrators and managers can view pending users' },
        { status: 403 }
      );
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