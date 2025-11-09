const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Must be at least 18 years old'],
      max: [100, 'Invalid age']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required']
    },
    course: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    interests: [{
      type: String,
      trim: true
    }],
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true
    },
    photos: [{
      type: String // URLs
    }]
  },
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18
      },
      max: {
        type: Number,
        default: 30,
        max: 100
      }
    },
    gender: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    maxDistance: {
      type: Number,
      default: 50 // km
    }
  },
  privacy: {
    showOnline: {
      type: Boolean,
      default: true
    },
    showProfile: {
      type: Boolean,
      default: true
    }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: Date,
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'profile.college': 1 });
userSchema.index({ 'profile.interests': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate verification token
userSchema.methods.generateVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.verificationToken = token;
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Method to check if user is premium
userSchema.methods.isPremiumActive = function() {
  return this.isPremium && this.premiumExpiry && this.premiumExpiry > Date.now();
};

module.exports = mongoose.model('User', userSchema);
