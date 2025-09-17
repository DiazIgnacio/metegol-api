import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin credentials - En producción esto debería estar en variables de entorno
const ADMIN_EMAIL = "Tomasgonzalosanchez1@gmail.com";
const ADMIN_PASSWORD_HASH =
  "$2b$12$gvUaFB2stcjXirHCLAeYze1HpXo8PXRnN/lEVdQsrdNvfw7ZTOgH2"; // Golazo01

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-for-development-only";

export interface AuthUser {
  email: string;
  isAdmin: boolean;
}

export class AuthService {
  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(
    email: string,
    password: string
  ): Promise<AuthUser | null> {
    // Check if email matches admin email (case insensitive)
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(
      password,
      ADMIN_PASSWORD_HASH
    );
    if (!isValidPassword) {
      return null;
    }

    return {
      email: ADMIN_EMAIL,
      isAdmin: true,
    };
  }

  /**
   * Generate JWT token for authenticated user
   */
  static generateToken(user: AuthUser): string {
    const payload = {
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
      issuer: "metegol-admin",
      audience: "metegol-admin",
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "metegol-admin",
        audience: "metegol-admin",
      }) as { email: string; isAdmin: boolean };

      return {
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: AuthUser | null): boolean {
    return user?.isAdmin === true;
  }
}

// Generar hash para la contraseña (solo para desarrollo/setup)
export async function generatePasswordHash(password: string): Promise<void> {
  const hash = await AuthService.hashPassword(password);
  console.log(`Password hash for "${password}": ${hash}`);
}

// Helper para verificar el hash actual
export async function verifyCurrentHash(): Promise<void> {
  const isValid = await AuthService.verifyPassword(
    "Golazo01",
    ADMIN_PASSWORD_HASH
  );
  console.log(`Current hash is valid: ${isValid}`);
}
