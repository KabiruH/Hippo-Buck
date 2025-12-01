// app/api/admin/users/[userId]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constant';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

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
        { error: 'Only administrators and managers can approve users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { approved } = body; // true to approve, false to reject

    // Get the user to be approved/rejected
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Can't modify admin accounts through this endpoint
    if (user.role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot modify admin accounts through this endpoint' },
        { status: 403 }
      );
    }

    if (approved) {
      // APPROVE USER
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: 'USER_APPROVED',
          entityType: 'User',
          entityId: userId,
          details: JSON.stringify({
            approvedBy: decoded.email,
            userEmail: updatedUser.email,
          }),
        },
      });

      return NextResponse.json({
        message: 'User approved successfully',
        user: updatedUser,
      });
    } else {
      // REJECT USER - Delete the account
      await prisma.user.delete({
        where: { id: userId },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: decoded.userId,
          action: 'USER_REJECTED',
          entityType: 'User',
          entityId: userId,
          details: JSON.stringify({
            rejectedBy: decoded.email,
            userEmail: user.email,
          }),
        },
      });

      return NextResponse.json({
        message: 'User registration rejected and account deleted',
      });
    }
  } catch (error) {
    console.error('User approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}