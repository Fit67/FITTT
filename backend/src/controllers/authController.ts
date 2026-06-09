import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { User }      from '../models/User'
import { AppError }  from '../middleware/errorHandler'
import {
  signAccessToken, signRefreshToken,
  verifyRefreshToken, setRefreshCookie, clearRefreshCookie,
  requireUser,
} from '../middleware/auth'

// ─── Register ──────────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone } = req.body as {
      name: string; email: string; password: string; phone?: string
    }

    if (await User.findOne({ email })) {
      return next(new AppError('Email already registered', 409))
    }

    const user         = await User.create({ name, email, password, phone })
    const accessToken  = signAccessToken(user._id.toString(), user.role)
    const refreshToken = signRefreshToken(user._id.toString())
    setRefreshCookie(res, refreshToken)

    res.status(201).json({
      success: true,
      data:    { user, accessToken },
      message: 'Account created successfully',
    })
  } catch (err) { next(err) }
}

// ─── Login ─────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string }

    const user = await User.findOne({ email, isActive: true }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401))
    }

    const accessToken  = signAccessToken(user._id.toString(), user.role)
    const refreshToken = signRefreshToken(user._id.toString())
    setRefreshCookie(res, refreshToken)

    res.json({ success: true, data: { user: user.toJSON(), accessToken }, message: 'Login successful' })
  } catch (err) { next(err) }
}

// ─── Refresh Token ─────────────────────────────────────────────
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined
    if (!token) return next(new AppError('No refresh token', 401))

    const decoded = verifyRefreshToken(token)
    const user    = await User.findById(decoded.sub)
    if (!user || !user.isActive) return next(new AppError('User not found or inactive', 401))

    const accessToken     = signAccessToken(user._id.toString(), user.role)
    const newRefreshToken = signRefreshToken(user._id.toString())
    setRefreshCookie(res, newRefreshToken)

    res.json({ success: true, data: { accessToken } })
  } catch (err) { next(err) }
}

// ─── Logout ────────────────────────────────────────────────────
export async function logout(_req: Request, res: Response) {
  clearRefreshCookie(res)
  res.json({ success: true, message: 'Logged out successfully' })
}

// ─── Get current user ──────────────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(requireUser(req).id)
    if (!user) return next(new AppError('User not found', 404))
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// ─── Update profile ────────────────────────────────────────────
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, phone, avatar } = req.body as { name?: string; phone?: string; avatar?: string }
    const user = await User.findByIdAndUpdate(
      requireUser(req).id,
      { name, phone, avatar },
      { new: true, runValidators: true },
    )
    res.json({ success: true, data: user, message: 'Profile updated' })
  } catch (err) { next(err) }
}

// ─── Change password ───────────────────────────────────────────
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string; newPassword: string
    }
    const user = await User.findById(requireUser(req).id).select('+password')
    if (!user) return next(new AppError('User not found', 404))
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401))
    }
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
}

// ─── Forgot password ───────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findOne({ email: (req.body as { email: string }).email })
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link was sent.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    // TODO: send email — for dev, log token to console
    console.log(`[DEV] Password reset token for ${user.email}: ${token}`)

    res.json({ success: true, message: 'If that email exists, a reset link was sent.' })
  } catch (err) { next(err) }
}

// ─── Reset password ────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body as { token: string; password: string }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) return next(new AppError('Token is invalid or has expired', 400))

    user.password             = password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successfully. Please log in.' })
  } catch (err) { next(err) }
}

// ─── Address management ────────────────────────────────────────
export async function addAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(requireUser(req).id)
    if (!user) return next(new AppError('User not found', 404))
    if ((req.body as { isDefault?: boolean }).isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
    }
    user.addresses.push(req.body)
    await user.save()
    res.status(201).json({ success: true, data: user })
  } catch (err) { next(err) }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(requireUser(req).id)
    if (!user) return next(new AppError('User not found', 404))

    // Use .find() instead of .id() — Mongoose's .id() isn't typed correctly in v8
    const addr = user.addresses.find(a => a._id.toString() === req.params.id)
    if (!addr) return next(new AppError('Address not found', 404))

    if ((req.body as { isDefault?: boolean }).isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
    }
    Object.assign(addr, req.body)
    await user.save()
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(requireUser(req).id)
    if (!user) return next(new AppError('User not found', 404))

    const filtered = user.addresses.filter(
      a => a._id.toString() !== req.params.id,
    )
    // Replace the array with filtered result using splice for Mongoose tracking
    user.addresses.splice(0, user.addresses.length, ...filtered)
    await user.save()
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}
