import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await matchAPI.getSuggestions();
      setSuggestions(response.data.data.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (currentIndex >= suggestions.length) return;

    const currentUser = suggestions[currentIndex];
    
    try {
      const response = await matchAPI.swipe({
        targetUserId: currentUser.user.id,
        action
      });

      if (response.data.data.match.isMatch) {
        setShowMatch(true);
        setTimeout(() => {
          setShowMatch(false);
          nextCard();
        }, 3000);
      } else {
        nextCard();
      }
    } catch (error) {
      console.error('Swipe error:', error);
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadSuggestions();
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  const currentUser = suggestions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-lavender-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">💘 CampusMatch</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/matches')}
              className="text-gray-600 hover:text-primary-600"
            >
              My Matches
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-primary-600"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
            <h2 className="text-4xl font-bold text-primary-600 mb-4">
              🎉 It's a Match! 🎉
            </h2>
            <p className="text-xl text-gray-600">
              You both liked each other!
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {!currentUser ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-4">😊</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No more profiles
            </h3>
            <p className="text-gray-600 mb-4">
              Check back later for new matches!
            </p>
            <button
              onClick={() => navigate('/matches')}
              className="btn-primary"
            >
              View My Matches
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* Profile Image */}
            <div className="relative h-96 bg-gradient-to-br from-primary-200 to-lavender-200">
              {currentUser.user.profile.photos?.[0] ? (
                <img
                  src={currentUser.user.profile.photos[0]}
                  alt={currentUser.user.profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl">
                  👤
                </div>
              )}
              
              {/* Compatibility Badge */}
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
                <span className="text-primary-600 font-bold">
                  {currentUser.compatibilityScore}% Match
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentUser.user.profile.name}, {currentUser.user.profile.age}
              </h2>
              
              {currentUser.user.profile.course && (
                <p className="text-gray-600 mb-2">
                  📚 {currentUser.user.profile.course}
                  {currentUser.user.profile.branch && ` - ${currentUser.user.profile.branch}`}
                </p>
              )}

              {currentUser.user.profile.bio && (
                <p className="text-gray-700 mb-4">
                  {currentUser.user.profile.bio}
                </p>
              )}

              {currentUser.user.profile.interests?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentUser.user.profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleSwipe('pass')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 rounded-2xl transition-colors"
                >
                  ✕ Pass
                </button>
                <button
                  onClick={() => handleSwipe('like')}
                  className="flex-1 btn-primary py-4"
                >
                  ♥ Like
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
