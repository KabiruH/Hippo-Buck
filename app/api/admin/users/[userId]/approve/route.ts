import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser, requireRole } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/constant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

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

    const body = await request.json();
    const { approved } = body; // true to approve, false to reject

    // Get the user to be approved/rejected
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Can't modify admin accounts through this endpoint
    if (userToUpdate.role === UserRole.ADMIN) {
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
          userId: user!.userId,
          action: 'USER_APPROVED',
          entityType: 'User',
          entityId: userId,
          details: JSON.stringify({
            approvedBy: user!.email,
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
          userId: user!.userId,
          action: 'USER_REJECTED',
          entityType: 'User',
          entityId: userId,
          details: JSON.stringify({
            rejectedBy: user!.email,
            userEmail: userToUpdate.email,
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