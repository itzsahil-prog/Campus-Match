const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Cache for compatibility scores (in-memory, could use Redis in production)
const compatibilityCache = new Map();

// Generate cache key for two users
const getCacheKey = (userId1, userId2) => {
  const [id1, id2] = [userId1.toString(), userId2.toString()].sort();
  return `${id1}_${id2}`;
};

// Calculate compatibility score using OpenAI
const calculateCompatibility = async (user1, user2) => {
  try {
    // Check cache first
    const cacheKey = getCacheKey(user1._id, user2._id);
    if (compatibilityCache.has(cacheKey)) {
      return compatibilityCache.get(cacheKey);
    }

    // Prepare user data for analysis
    const prompt = `Analyze compatibility between two college students and return ONLY a JSON object with a score (0-100) and brief reason.

User A:
- Interests: ${user1.profile.interests.join(', ') || 'None listed'}
- Bio: ${user1.profile.bio || 'No bio'}
- Course: ${user1.profile.course || 'Not specified'}
- Age: ${user1.profile.age}

User B:
- Interests: ${user2.profile.interests.join(', ') || 'None listed'}
- Bio: ${user2.profile.bio || 'No bio'}
- Course: ${user2.profile.course || 'Not specified'}
- Age: ${user2.profile.age}

Return format: {"score": number, "reason": "brief explanation"}`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a matchmaking expert. Analyze compatibility and return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // Fallback to basic scoring if JSON parsing fails
      result = calculateBasicCompatibility(user1, user2);
    }

    // Ensure score is within range
    const score = Math.max(0, Math.min(100, result.score || 50));

    // Cache the result
    compatibilityCache.set(cacheKey, score);

    return score;
  } catch (error) {
    console.error('OpenAI compatibility error:', error.message);
    // Fallback to basic compatibility calculation
    return calculateBasicCompatibility(user1, user2);
  }
};

// Basic compatibility calculation (fallback)
const calculateBasicCompatibility = (user1, user2) => {
  let score = 50; // Base score

  // Shared interests (40% weight)
  const interests1 = new Set(user1.profile.interests || []);
  const interests2 = new Set(user2.profile.interests || []);
  const sharedInterests = [...interests1].filter(i => interests2.has(i));
  const interestScore = (sharedInterests.length / Math.max(interests1.size, interests2.size, 1)) * 40;
  score += interestScore;

  // Same course (20% weight)
  if (user1.profile.course && user2.profile.course && 
      user1.profile.course.toLowerCase() === user2.profile.course.toLowerCase()) {
    score += 20;
  }

  // Age compatibility (10% weight)
  const ageDiff = Math.abs(user1.profile.age - user2.profile.age);
  if (ageDiff <= 2) score += 10;
  else if (ageDiff <= 5) score += 5;

  return Math.min(100, Math.round(score));
};

// Moderate content using OpenAI
const moderateContent = async (content) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      {
        input: content
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.results[0];
    
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores
    };
  } catch (error) {
    console.error('OpenAI moderation error:', error.message);
    // Return safe result on error
    return {
      flagged: false,
      categories: {},
      categoryScores: {}
    };
  }
};

module.exports = {
  calculateCompatibility,
  moderateContent
};
