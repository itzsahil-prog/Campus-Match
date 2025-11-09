const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if email domain is allowed
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS.split(',');
    const emailDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_DOMAIN',
          message: 'Please use a valid college email address'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      profile: { name }
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.profile.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SIGNUP_ERROR',
        message: error.message || 'Registration failed'
      }
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Verification token is required'
        }
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token'
        }
      });
    }

    // Verify user
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Generate JWT token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Email verification failed'
      }
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in'
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

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
          isPremium: user.isPremiumActive()
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Login failed'
      }
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = user.generateVerificationToken();
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.profile.name);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_ERROR',
        message: 'Failed to process password reset request'
      }
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Token and password are required'
        }
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Update password
    user.password = password;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: 'Failed to reset password'
      }
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
};
