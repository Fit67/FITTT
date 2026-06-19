// ============================================================
// backend/src/routes/auth.ts
// ============================================================
import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import * as ctrl from '../controllers/authController'

const router = Router()

router.post('/register',       ctrl.register)
router.post('/login',          ctrl.login)
router.post('/google',         ctrl.googleAuth)
router.post('/logout',         ctrl.logout)
router.post('/refresh-token',  ctrl.refreshToken)
router.post('/forgot-password',ctrl.forgotPassword)
router.post('/reset-password', ctrl.resetPassword)

router.use(authenticate)
router.get   ('/me',                 ctrl.getMe)
router.patch ('/me',                 ctrl.updateMe)
router.post  ('/change-password',    ctrl.changePassword)
router.post  ('/addresses',          ctrl.addAddress)
router.patch ('/addresses/:id',      ctrl.updateAddress)
router.delete('/addresses/:id',      ctrl.deleteAddress)
router.post  ('/wishlist/toggle',    ctrl.toggleWishlist)

export default router
