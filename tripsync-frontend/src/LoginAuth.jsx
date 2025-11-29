import React, { useState, useEffect } from 'react';
import { Mail, User, KeyRound, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthAPI } from './apiService';

export default function LoginAuth({ onLoginSuccess, onBackToHome }) {
  const [step, setStep] = useState('input'); // 'input', 'register', 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInvite, setHasInvite] = useState(false);
  console.log('🔍 localStorage pendingInvite:', localStorage.getItem('pendingInvite'));
  console.log('🔍 localStorage pendingInvite type:', typeof localStorage.getItem('pendingInvite'));
  
// Check for pending invite on mount
useEffect(() => {
  const pendingInvite = localStorage.getItem('pendingInvite');
  
  // Check if invite exists and is valid (not empty, not "null", not "undefined")
  if (pendingInvite && 
      pendingInvite !== '' && 
      pendingInvite !== 'null' && 
      pendingInvite !== 'undefined') {
    setHasInvite(true);
    console.log('✅ Pending invite found:', pendingInvite);
  } else {
    setHasInvite(false);
    // Clean up invalid values
    if (pendingInvite) {
      localStorage.removeItem('pendingInvite');
      console.log('🧹 Cleaned up invalid invite token');
    }
  }
}, []);

  // Handle Login
  const handleLogin = async () => {
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Get invite token if exists
      const inviteToken = localStorage.getItem('pendingInvite');
      
      const response = await AuthAPI.login(email, password, inviteToken);
      
      // Get user details
      const userDetails = await AuthAPI.getCurrentUser();
      
      // Clear the pending invite
      if (inviteToken) {
        localStorage.removeItem('pendingInvite');
        console.log('✅ User added to trip via invite token');
      }
      
      setStep('success');
      
      // After showing success, call the login success callback
      setTimeout(() => {
        onLoginSuccess({ 
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          ...userDetails
        });
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async () => {
    setError('');

    // Validation
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Get invite token if exists
      const inviteToken = localStorage.getItem('pendingInvite');
      
      await AuthAPI.register({
        email,
        password,
        firstName,
        lastName,
        inviteToken // Include invite token in registration
      });

      console.log(inviteToken ? '✅ Registered with invite token' : '✅ Registered successfully');

      // Auto-login after registration
      await handleLogin();
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home Button */}
        {step !== 'success' && onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        )}

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TripSync</h1>
          <p className="text-gray-600">
            {hasInvite && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                <CheckCircle size={16} />
                You have a trip invite!
              </span>
            )}
            <br />
            {isRegistering ? 'Create an account to start planning' : 'Sign in to start planning your adventures'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isRegistering ? 'Create Account' : 'Welcome Back!'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isRegistering ? 'Fill in your details to get started' : 'Enter your credentials to continue'}
                  {hasInvite && (
                    <span className="block mt-1 text-green-600 font-medium">
                      You'll be added to the trip after {isRegistering ? 'registration' : 'login'}!
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {/* Name Inputs (only for registration) */}
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={isRegistering ? handleRegister : handleLogin}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isRegistering ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isRegistering ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

              {/* Toggle between Login/Register */}
              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={toggleMode}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    {isRegistering ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isRegistering ? 'Account Created!' : 'Welcome Back!'}
                </h2>
                <p className="text-gray-600">
                  {hasInvite ? 'Joining your trip...' : 'Logging you in...'}
                </p>
              </div>
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </div>
          )}
        </div> 
      </div>
    </div>
  );
}