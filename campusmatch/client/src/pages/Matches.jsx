import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await matchAPI.getMatches();
      setMatches(response.data.data.matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-lavender-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-primary-600"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary-600">My Matches</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Matches Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">💔</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No matches yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start swiping to find your perfect match!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-200 to-lavender-200 flex items-center justify-center text-3xl overflow-hidden">
                    {match.user.profile.photos?.[0] ? (
                      <img
                        src={match.user.profile.photos[0]}
                        alt={match.user.profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {match.user.profile.name}, {match.user.profile.age}
                    </h3>
                    {match.user.profile.course && (
                      <p className="text-sm text-gray-600">
                        {match.user.profile.course}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {match.compatibilityScore}% Match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {match.user.profile.bio && (
                  <p className="text-gray-700 text-sm mt-4 line-clamp-2">
                    {match.user.profile.bio}
                  </p>
                )}

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/chat/${match.user.id}`)}
                  className="btn-primary w-full mt-4"
                >
                  Send Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
