const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  reportedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reason: {
    type: String,
    enum: ['harassment', 'inappropriate', 'spam', 'fake', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['warning', 'content_removed', 'user_banned', 'dismissed']
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedPost: 1 });

// Validation: At least one reported entity must be present
reportSchema.pre('validate', function(next) {
  if (!this.reportedUser && !this.reportedPost && !this.reportedMessage) {
    next(new Error('Report must have at least one reported entity (user, post, or message)'));
  } else {
    next();
  }
});

// Method to resolve report
reportSchema.methods.resolve = function(adminId, action) {
  this.status = 'resolved';
  this.reviewedBy = adminId;
  this.action = action;
  this.resolvedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
