const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched'],
    default: 'pending'
  },
  user1Action: {
    type: String,
    enum: ['like', 'pass', null],
    default: null
  },
  user2Action: {
    type: String,
    enum: ['like', 'pass', null],
    default: null
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedAt: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate matches and optimize queries
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1, status: 1 });
matchSchema.index({ user2: 1, status: 1 });
matchSchema.index({ status: 1, matchedAt: -1 });

// Pre-save middleware to ensure user1 < user2 (prevent duplicates)
matchSchema.pre('save', function(next) {
  // Ensure user1 is always the "smaller" ObjectId to prevent duplicate entries
  if (this.user1.toString() > this.user2.toString()) {
    [this.user1, this.user2] = [this.user2, this.user1];
    [this.user1Action, this.user2Action] = [this.user2Action, this.user1Action];
  }
  next();
});

// Method to check if both users liked each other
matchSchema.methods.checkMutualMatch = function() {
  if (this.user1Action === 'like' && this.user2Action === 'like') {
    this.status = 'matched';
    this.matchedAt = new Date();
    return true;
  }
  return false;
};

// Static method to find or create match
matchSchema.statics.findOrCreateMatch = async function(userId1, userId2) {
  // Ensure consistent ordering
  const [user1, user2] = userId1.toString() < userId2.toString() 
    ? [userId1, userId2] 
    : [userId2, userId1];

  let match = await this.findOne({ user1, user2 });
  
  if (!match) {
    match = await this.create({ user1, user2 });
  }
  
  return match;
};

module.exports = mongoose.model('Match', matchSchema);
