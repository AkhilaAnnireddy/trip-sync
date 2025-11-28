import React, { useState } from 'react';
import HomePage from './HomePage';
import TravelPlanner from './TravelPlanner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleGetStarted = (data) => {
    console.log('Login success, user data:', data);
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsLoggedIn(false);
    setUserData(null);
  };

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