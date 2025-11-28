import React, { useState } from 'react';
import { User, LogOut, Mail, UserCircle, X, MapPin } from 'lucide-react';

export default function ProfileComponent({ currentUser, userEmail, onLogout, tripsCreated = 0, tripsJoined = 0 }) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    setShowProfileModal(false);
    onLogout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Profile Icon Button */}
      <button
        onClick={() => setShowProfileModal(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        title="View Profile"
      >
        <span className="text-sm">{getInitials(currentUser)}</span>
      </button>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-8 rounded-t-lg relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
              >
                <X size={20} />
              </button>
              
              {/* Avatar Circle */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md mb-3">
                  <span className="text-3xl font-bold text-indigo-600">
                    {getInitials(currentUser)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white text-center">
                  {currentUser || 'User'}
                </h2>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6 space-y-4">
              {/* Name Section */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserCircle size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentUser || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Email Section */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mail size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userEmail || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{tripsCreated}</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Trips Created</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                  <p className="text-2xl font-bold text-green-600">{tripsJoined}</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Trips Joined</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}