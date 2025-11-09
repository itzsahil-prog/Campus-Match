const User = require('../models/User');
const { uploadImage } = require('../config/cloudinary');
const fs = require('fs').promises;

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          emailVerified: user.emailVerified,
          profile: user.profile,
          preferences: user.preferences,
          privacy: user.privacy,
          isPremium: user.isPremiumActive(),
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PROFILE_ERROR',
        message: 'Failed to fetch profile'
      }
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if user is blocked
    if (user.blockedUsers.includes(req.user._id) || req.user.blockedUsers.includes(user._id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'USER_BLOCKED',
          message: 'Cannot view this profile'
        }
      });
    }

    // Check privacy settings
    if (!user.privacy.showProfile && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PROFILE_PRIVATE',
          message: 'This profile is private'
        }
      });
    }

    // Return limited profile info
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          profile: {
            name: user.profile.name,
            age: user.profile.age,
            gender: user.profile.gender,
            course: user.profile.course,
            branch: user.profile.branch,
            college: user.profile.college,
            interests: user.profile.interests,
            bio: user.profile.bio,
            photos: user.profile.photos
          },
          isPremium: user.isPremiumActive(),
          lastActive: user.privacy.showOnline ? user.lastActive : null
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PROFILE_ERROR',
        message: 'Failed to fetch profile'
      }
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'age', 'gender', 'course', 'branch', 'college', 'interests', 'bio'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[`profile.${key}`] = req.body[key];
      }
    });

    // Update preferences if provided
    if (req.body.preferences) {
      Object.keys(req.body.preferences).forEach(key => {
        updates[`preferences.${key}`] = req.body.preferences[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          profile: user.profile,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: error.message || 'Failed to update profile'
      }
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { showOnline, showProfile } = req.body;
    const updates = {};

    if (typeof showOnline === 'boolean') {
      updates['privacy.showOnline'] = showOnline;
    }

    if (typeof showProfile === 'boolean') {
      updates['privacy.showProfile'] = showProfile;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        privacy: user.privacy
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_SETTINGS_ERROR',
        message: 'Failed to update settings'
      }
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ACCOUNT_ERROR',
        message: 'Failed to delete account'
      }
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Please upload an image file'
        }
      });
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file, 'campusmatch/profiles');

    // Delete local file after upload
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to delete local file:', unlinkError);
    }

    // Add photo URL to user profile
    const user = await User.findById(req.user._id);
    
    // Limit to 6 photos
    if (user.profile.photos.length >= 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MAX_PHOTOS_REACHED',
          message: 'Maximum 6 photos allowed'
        }
      });
    }

    user.profile.photos.push(result.url);
    await user.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: result.url,
        photos: user.profile.photos
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    
    // Clean up local file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete local file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Failed to upload photo'
      }
    });
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/users/profile/photo/:index
// @access  Private
const deletePhoto = async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.index);
    const user = await User.findById(req.user._id);

    if (photoIndex < 0 || photoIndex >= user.profile.photos.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INDEX',
          message: 'Invalid photo index'
        }
      });
    }

    // Remove photo from array
    user.profile.photos.splice(photoIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        photos: user.profile.photos
      }
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PHOTO_ERROR',
        message: 'Failed to delete photo'
      }
    });
  }
};

module.exports = {
  getMe,
  getUserProfile,
  updateProfile,
  updateSettings,
  deleteAccount,
  uploadPhoto,
  deletePhoto
};
