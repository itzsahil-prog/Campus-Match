import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    course: '',
    branch: '',
    bio: '',
    interests: []
  });
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        name: user.profile.name || '',
        age: user.profile.age || '',
        gender: user.profile.gender || '',
        course: user.profile.course || '',
        branch: user.profile.branch || '',
        bio: user.profile.bio || '',
        interests: user.profile.interests || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await userAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
      await checkAuth();
    } catch (error) {
      setMessage(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await userAPI.uploadPhoto(formData);
      setMessage('Photo uploaded successfully!');
      await checkAuth();
    } catch (error) {
      setMessage(error.response?.data?.error?.message || 'Failed to upload photo');
    }
  };

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
          <h1 className="text-2xl font-bold text-primary-600">My Profile</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Profile Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-2xl ${
              message.includes('success') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photos
            </label>
            <div className="flex gap-4 flex-wrap mb-4">
              {user?.profile?.photos?.map((photo, idx) => (
                <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="input-field"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  className="input-field"
                  min="18"
                  max="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={profile.course}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={profile.branch}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., AI & ML"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="input-field"
                rows="4"
                maxLength="500"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile.bio.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  className="input-field flex-1"
                  placeholder="Add an interest"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-primary-900 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
