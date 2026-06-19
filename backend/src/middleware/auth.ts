import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'

// ─── Constants ─────────────────────────────────────────────────
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? ''
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? ''

function assertSecrets() {
  if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables')
  }
}

// ─── Extend Express Request type ───────────────────────────────
export interface AuthUser {
  id:   string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

// ─── Token helpers ─────────────────────────────────────────────
export function signAccessToken(userId: string, role: string): string {
  assertSecrets()
  return jwt.sign({ sub: userId, role }, ACCESS_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(userId: string): string {
  assertSecrets()
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): { sub: string; role: string } {
  assertSecrets()
  return jwt.verify(token, ACCESS_SECRET) as { sub: string; role: string }
}

export function verifyRefreshToken(token: string): { sub: string } {
  assertSecrets()
  return jwt.verify(token, REFRESH_SECRET) as { sub: string }
}

// ─── Cookie helpers ────────────────────────────────────────────
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/api/auth',
  })
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    path:     '/api/auth',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
}

// ─── Guard: asserts req.user exists (throws if not) ────────────
export function requireUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }
  return req.user
}

// ─── authenticate middleware ───────────────────────────────────
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401))
    return
  }

  const token = authHeader.slice(7)
  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.sub, role: decoded.role }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

// ─── authorize middleware (role-based) ────────────────────────
export function authorize(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(new AppError('Authentication required', 401))
      return
    }
    try {
      // Always fetch role from DB — prevents stale JWT role after demotion
      const { User } = await import('../models/User')
      const user = await User.findById(req.user.id).select('role isActive').lean()
      if (!user || !user.isActive) {
        next(new AppError('Account not found or deactivated', 403))
        return
      }
      req.user.role = user.role  // update req.user with live role
      if (!roles.includes(user.role)) {
        next(new AppError('You do not have permission to perform this action', 403))
        return
      }
    } catch {
      next(new AppError('Authorization check failed', 500))
      return
    }
    next()
  }
}

// ─── optionalAuth middleware ───────────────────────────────────
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }
  try {
    const decoded = verifyAccessToken(authHeader.slice(7))
    req.user = { id: decoded.sub, role: decoded.role }
  } catch {
    // Silently ignore invalid optional tokens
  }
  next()
}
