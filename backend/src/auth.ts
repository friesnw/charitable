import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from './env.js';

// Token expiration times
export const TOKEN_EXPIRY = {
  MAGIC_LINK: 15 * 60 * 1000,        // 15 minutes (in ms) for magic link
  JWT: '15d' as const,               // 15 days for JWT
};

// JWT payload type
export interface JwtPayload {
  userId: number;
  email: string;
}

// GraphQL context type
export interface Context {
  user: JwtPayload | null;
}

// Sign a JWT for a user
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: TOKEN_EXPIRY.JWT };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

// Verify and decode a JWT
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Generate a random token for magic links
export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Get magic link expiration date
export function getMagicLinkExpiry(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY.MAGIC_LINK);
}
