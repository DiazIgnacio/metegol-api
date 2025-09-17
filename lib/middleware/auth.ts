import { NextRequest, NextResponse } from "next/server";
import { AuthService, AuthUser } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

/**
 * Middleware to protect admin routes
 */
export function withAdminAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from cookie
      const token = request.cookies.get("admin-token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "No autorizado - Token requerido" },
          { status: 401 }
        );
      }

      // Verify token
      const user = AuthService.verifyToken(token);

      if (!user) {
        return NextResponse.json(
          { error: "No autorizado - Token inválido" },
          { status: 401 }
        );
      }

      // Check if user is admin
      if (!AuthService.isAdmin(user)) {
        return NextResponse.json(
          { error: "Prohibido - Requiere privilegios de administrador" },
          { status: 403 }
        );
      }

      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;

      // Call the actual handler
      return handler(authenticatedRequest);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract user from request (for use in protected routes)
 */
export function getAuthenticatedUser(
  request: AuthenticatedRequest
): AuthUser | null {
  return request.user || null;
}

/**
 * Helper function to check authentication without middleware
 */
export async function checkAuthentication(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    const user = AuthService.verifyToken(token);

    if (!user || !AuthService.isAdmin(user)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Authentication check error:", error);
    return null;
  }
}
