const Match = require('../models/Match');
const User = require('../models/User');
const { calculateCompatibility } = require('../services/openaiService');

// @desc    Get match suggestions
// @route   GET /api/matches/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Get users already swiped on
    const existingMatches = await Match.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    });

    const swipedUserIds = existingMatches.map(match => {
      return match.user1.toString() === req.user._id.toString() 
        ? match.user2.toString() 
        : match.user1.toString();
    });

    // Build query for potential matches
    const query = {
      _id: { 
        $ne: req.user._id,
        $nin: [...swipedUserIds, ...currentUser.blockedUsers]
      },
      emailVerified: true,
      isActive: true,
      isBanned: false
    };

    // Apply preferences
    if (currentUser.preferences.gender && currentUser.preferences.gender.length > 0) {
      query['profile.gender'] = { $in: currentUser.preferences.gender };
    }

    if (currentUser.preferences.ageRange) {
      query['profile.age'] = {
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max
      };
    }

    // Get potential matches
    let potentialMatches = await User.find(query)
      .select('profile preferences')
      .limit(50);

    // Calculate compatibility scores
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (user) => {
        const score = await calculateCompatibility(currentUser, user);
        return {
          user: {
            id: user._id,
            profile: user.profile
          },
          compatibilityScore: score
        };
      })
    );

    // Sort by compatibility and return top 10
    const topMatches = matchesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        suggestions: topMatches,
        count: topMatches.length
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUGGESTIONS_ERROR',
        message: 'Failed to fetch match suggestions'
      }
    });
  }
};

// @desc    Record swipe action
// @route   POST /api/matches/swipe
// @access  Private
const swipe = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;

    if (!targetUserId || !action) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Target user ID and action are required'
        }
      });
    }

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Action must be "like" or "pass"'
        }
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Target user not found'
        }
      });
    }

    // Find or create match
    const match = await Match.findOrCreateMatch(req.user._id, targetUserId);

    // Update action
    const isUser1 = match.user1.toString() === req.user._id.toString();
    if (isUser1) {
      match.user1Action = action;
    } else {
      match.user2Action = action;
    }

    // Check for mutual match
    const isMutualMatch = match.checkMutualMatch();
    
    // Calculate compatibility if it's a match
    if (isMutualMatch && !match.compatibilityScore) {
      const currentUser = await User.findById(req.user._id);
      match.compatibilityScore = await calculateCompatibility(currentUser, targetUser);
    }

    await match.save();

    res.json({
      success: true,
      message: isMutualMatch ? 'It\'s a match!' : 'Swipe recorded',
      data: {
        match: {
          id: match._id,
          status: match.status,
          isMatch: isMutualMatch,
          compatibilityScore: match.compatibilityScore
        }
      }
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SWIPE_ERROR',
        message: 'Failed to record swipe'
      }
    });
  }
};

// @desc    Get all matches
// @route   GET /api/matches/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ],
      status: 'matched'
    })
    .populate('user1', 'profile')
    .populate('user2', 'profile')
    .sort({ matchedAt: -1 });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1._id.toString() === req.user._id.toString() 
        ? match.user2 
        : match.user1;

      return {
        id: match._id,
        user: {
          id: otherUser._id,
          profile: otherUser.profile
        },
        compatibilityScore: match.compatibilityScore,
        matchedAt: match.matchedAt
      };
    });

    res.json({
      success: true,
      data: {
        matches: formattedMatches,
        count: formattedMatches.length
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MATCHES_ERROR',
        message: 'Failed to fetch matches'
      }
    });
  }
};

// @desc    Unmatch with user
// @route   DELETE /api/matches/match/:id
// @access  Private
const unmatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    // Verify user is part of the match
    if (match.user1.toString() !== req.user._id.toString() && 
        match.user2.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Not authorized to unmatch'
        }
      });
    }

    match.status = 'unmatched';
    await match.save();

    res.json({
      success: true,
      message: 'Unmatched successfully'
    });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UNMATCH_ERROR',
        message: 'Failed to unmatch'
      }
    });
  }
};

module.exports = {
  getSuggestions,
  swipe,
  getMatches,
  unmatch
};
