import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Try to authenticate and log activity (optional - logout should work even if token is invalid)
    const { user } = await authenticateUser(request);

    // Log activity if user was authenticated
    if (user) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: user.userId,
            action: 'USER_LOGOUT',
            entityType: 'User',
            entityId: user.userId,
            details: JSON.stringify({
              email: user.email,
              logoutTime: new Date().toISOString(),
            }),
          },
        });
      } catch (logError) {
        console.error('Error logging logout activity:', logError);
        // Don't fail logout if logging fails
      }
    }

    // Create response
    const response = NextResponse.json(
      {
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear the httpOnly cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, still clear the cookie
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}