import express from 'express';
import {
  signup,
  signin,
  getMe,
  signout,
  getAllUsersController,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes - simplified
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/users', getAllUsersController); // For testing purposes

// Protected routes - simplified
router.get('/me', authMiddleware, getMe);
router.post('/signout', authMiddleware, signout);

export default router;
