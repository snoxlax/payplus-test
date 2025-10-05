import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createUser,
  findUserByEmail,
  verifyPassword,
  getUserWithoutPassword,
  getAllUsers,
} from '../models/userModel.js';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

export const signup = asyncHandler(async (req, res) => {
  const { email, password, name, idNumber } = req.body;

  console.log('User signup attempt:', { email, name, idNumber });

  if (!idNumber || !/^\d{9}$/.test(idNumber)) {
    return res.status(400).json({
      success: false,
      error: 'ID number must be exactly 9 digits',
    });
  }
  const user = await createUser(email, password, name, idNumber);

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: getUserWithoutPassword(user),
  });
});

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('User signin attempt:', { email });

  const user = await findUserByEmail(email);
  if (!user) {
    console.log('Signin failed - user not found:', { email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  const match = await verifyPassword(password, user.password);
  if (!match) {
    console.log('Signin failed - invalid password:', { email, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Generate token
  const token = generateToken(user);

  console.log('User signed in successfully:', {
    email,
    userId: user.id,
    fullUser: user,
  });

  res.json({
    success: true,
    token,
    user: getUserWithoutPassword(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.user.email);
  if (!user) {
    console.log('User not found for getMe:', { email: req.user.email });
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  console.log('User info retrieved:', { email: user.email });

  res.json({
    success: true,
    user: getUserWithoutPassword(user),
  });
});

export const signout = asyncHandler(async (req, res) => {
  console.log('User signed out:', { email: req.user?.email });

  res.json({
    success: true,
    message: 'Signed out successfully',
  });
});

// Get all users (for testing)
export const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await getAllUsers();

  console.log('All users retrieved:', { count: users.length });

  res.json({
    success: true,
    message: `Found ${users.length} users`,
    users,
  });
});
