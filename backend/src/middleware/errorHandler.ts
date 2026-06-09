import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode    = statusCode
    this.isOperational = true
    // Node.js-specific stack trace capture — cast to avoid TS strict type check
    const E = Error as unknown as { captureStackTrace?: (t: object, c: unknown) => void }
    if (E.captureStackTrace) E.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError & { code?: number; path?: string; value?: unknown; errors?: Record<string, unknown> },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  let statusCode = err.statusCode ?? 500
  let message    = err.message    ?? 'Internal Server Error'

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err as unknown as Record<string, unknown>).find(k => k === 'keyValue')
    statusCode = 409
    message    = `A record with this ${field ?? 'value'} already exists.`
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = 400
    message    = `Invalid ${err.path}: ${err.value}`
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors ?? {})
      .map((e: unknown) => (e as { message: string }).message)
      .join(', ')
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token' }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired'  }

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err)
  }

  res.status(statusCode).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${_req.originalUrl} not found`, 404))
}
