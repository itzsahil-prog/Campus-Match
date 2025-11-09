const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'voice'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationFlag: {
    type: String,
    enum: ['clean', 'harassment', 'sexual', 'hate', 'violence', 'spam']
  },
  readAt: Date
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, status: 1 });

// Static method to generate conversation ID
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Ensure consistent conversation ID regardless of who sends first
  const [user1, user2] = userId1.toString() < userId2.toString() 
    ? [userId1, userId2] 
    : [userId2, userId1];
  return `${user1}_${user2}`;
};

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to mark message as delivered
messageSchema.methods.markAsDelivered = function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('Message', messageSchema);
