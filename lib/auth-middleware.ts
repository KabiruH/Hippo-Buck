import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function authenticateUser(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized. No token provided.' },
          { status: 401 }
        ),
      };
    }

    // Verify token using jose
    const { payload } = await jwtVerify(token, secret);

    return {
      user: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      },
      error: null,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      ),
    };
  }
}

// Helper to require admin role
export async function requireAdmin(request: NextRequest) {
  const { user, error } = await authenticateUser(request);
  
  if (error) {
    return { user: null, error };
  }
  
  if (user?.role !== 'ADMIN') {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
    };
  }
  
  return { user, error: null };
}