import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser, requireRole } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/constant';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET single user
export async function GET(
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

    // Check if user has required role (ADMIN or MANAGER)
    const roleError = requireRole(user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (roleError) {
      return roleError;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: targetUser }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE user
export async function PUT(
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

    // Only ADMIN can edit users
    const roleError = requireRole(user!, [UserRole.ADMIN]);
    if (roleError) {
      return roleError;
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, role, isActive, password } = body;

    // Get the user to be updated
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from editing their own role (safety measure)
    if (userId === user!.userId && role && role !== targetUser.role) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    // Check if email is being changed and is already taken
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: userId,
        details: JSON.stringify({
          updatedBy: user!.email,
          targetUser: updatedUser.email,
          changes: Object.keys(updateData),
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
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

    // Only ADMIN can delete users
    const roleError = requireRole(user!, [UserRole.ADMIN]);
    if (roleError) {
      return roleError;
    }

    // Prevent admin from deleting themselves
    if (userId === user!.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user!.userId,
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: userId,
        details: JSON.stringify({
          deletedBy: user!.email,
          deletedUser: targetUser.email,
        }),
      },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}