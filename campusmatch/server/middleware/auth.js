const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: 'Not authorized to access this route'
      }
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token'
        }
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_USER_BANNED',
          message: 'Your account has been banned',
          details: { reason: user.banReason }
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_USER_INACTIVE',
          message: 'Your account is inactive'
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    });
  }
};

// Require email verification
const requireVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address'
      }
    });
  }
  next();
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: 'Admin access required'
      }
    });
  }
  next();
};

module.exports = {
  protect,
  requireVerified,
  adminOnly
};
