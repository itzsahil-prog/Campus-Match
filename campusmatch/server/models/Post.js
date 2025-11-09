const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Post content cannot exceed 1000 characters']
  },
  images: [{
    type: String // URLs
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  isRemoved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isTrending: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likeCount: -1, commentCount: -1 });

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex(id => id.toString() === userIdStr);
  
  if (likeIndex > -1) {
    // Unlike
    this.likes.splice(likeIndex, 1);
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    // Like
    this.likes.push(userId);
    this.likeCount += 1;
  }
  
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(userId, text) {
  this.comments.push({ user: userId, text });
  this.commentCount += 1;
  return this.save();
};

// Method to calculate trending score
postSchema.methods.calculateTrendingScore = function() {
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const decayFactor = Math.pow(ageInHours + 2, 1.5);
  
  // Score based on likes, comments, and recency
  const score = (this.likeCount * 2 + this.commentCount * 3) / decayFactor;
  return score;
};

module.exports = mongoose.model('Post', postSchema);
