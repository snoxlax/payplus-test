import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.log('No authorization header provided:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.log('Invalid authorization header format:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid token format',
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      console.log('Token verification failed:', {
        error: err.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    req.user = user;
    console.log('Token verified successfully:', {
      email: user.email,
      id: user.id,
      fullUser: user,
    });
    next();
  });
};
