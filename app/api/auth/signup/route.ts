import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { UserRole, isValidUserRole } from '@/lib/constant';
import { authenticateUser } from '@/lib/auth-middleware';

// Add these for Next.js 15+
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if request is from an admin
    const { user: adminUser } = await authenticateUser(request);
    const isAdminCreating = adminUser?.role === UserRole.ADMIN;

    const body = await request.json();
    const { email, password, firstName, lastName, phone, role, isActive = true } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    const userRole = role || UserRole.STAFF;
    if (!isValidUserRole(userRole)) {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }

    // 🔒 PREVENT ADMIN ROLE CREATION unless created by admin
    if (userRole === UserRole.ADMIN && !isAdminCreating) {
      return NextResponse.json(
        { error: 'Admin accounts cannot be created through signup. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - Active by default if admin is creating, otherwise needs approval
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: userRole,
        isActive: isAdminCreating ? isActive : false, // Admin can create active users directly
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
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: adminUser?.userId || user.id,
        action: isAdminCreating ? 'USER_CREATED_BY_ADMIN' : 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        details: JSON.stringify({
          email: user.email,
          role: user.role,
          status: user.isActive ? 'ACTIVE' : 'PENDING_APPROVAL',
          createdBy: isAdminCreating ? adminUser?.email : 'self',
        }),
      },
    });

    // If admin is creating, return success without approval message
    if (isAdminCreating) {
      return NextResponse.json(
        {
          message: 'User created successfully!',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
          },
        },
        { status: 201 }
      );
    }

    // For self-registration, return approval required message
    return NextResponse.json(
      {
        message: 'Account created successfully! Your account is pending approval from an administrator. You will be notified once approved.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        },
        requiresApproval: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}