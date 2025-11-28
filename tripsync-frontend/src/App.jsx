import React, { useState, useEffect } from 'react';
import { AuthAPI, TokenManager } from './apiService';
import HomePage from './HomePage';
import TravelPlanner from './TravelPlanner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = TokenManager.getToken();
      console.log('Checking for existing token:', token ? 'Found' : 'Not found');
      
      if (token) {
        try {
          // Verify token is still valid by fetching user data
          const user = await AuthAPI.getCurrentUser();
          console.log('Token valid, user:', user);
          setUserData(user);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          TokenManager.removeToken();
          setIsLoggedIn(false);
          setUserData(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleGetStarted = (data) => {
    console.log('Login success, user data:', data);
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    TokenManager.removeToken();
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  return (
    <TravelPlanner 
      userData={userData} 
      onLogoutToHome={handleLogout} 
    />
  );
}