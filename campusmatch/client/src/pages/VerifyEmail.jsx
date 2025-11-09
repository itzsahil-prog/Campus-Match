import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('waiting');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      const { token: authToken, user } = response.data.data;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setStatus('success');
      setMessage('Email verified successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-lavender-100 to-pink-50">
      <div className="card max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">
          {status === 'verifying' && '⏳'}
          {status === 'waiting' && '📧'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'waiting' && 'Check Your Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        {status === 'waiting' && (
          <div>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to{' '}
              <strong>{location.state?.email}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              Please check your email and click the verification link to continue.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Back to Login
            </button>
          </div>
        )}

        {message && (
          <p className={`text-${status === 'error' ? 'red' : 'green'}-600 mb-4`}>
            {message}
          </p>
        )}

        {status === 'error' && (
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
