import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, MapPin, Users, ClipboardList, Share2, Copy, X, GripVertical, ThumbsUp, ThumbsDown, Calendar, DollarSign, Menu } from 'lucide-react';
import { InteractiveMapComponent } from './InteractiveMapComponent';
import TripCreationAutocomplete from './TripCreationAutocomplete';
import LoginAuth from './LoginAuth';
import ExpenseTab from './ExpenseTab';
import ItineraryTab from './ItineraryTab';
import ProfileComponent from './ProfileComponent';
import TaskTab from './TaskTab';
import { TripsAPI, AuthAPI } from './apiService';

export default function TravelPlanner({ userData, onLogoutToHome }) {
  const [currentTab, setCurrentTab] = useState('map');
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [tripInvites, setTripInvites] = useState({});

  const [customPins, setCustomPins] = useState({});
  const [draggedPin, setDraggedPin] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (userData) {
      fetchUserAndTrips();
    }
  }, [userData]);

  const fetchUserAndTrips = async () => {
    setLoading(true);
    try {
      const user = await AuthAPI.getCurrentUser();
      setCurrentUser({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });

      const tripsData = await TripsAPI.getAllTrips();

      const transformedTrips = tripsData.map(trip => ({
        id: trip.id,
        name: trip.name,
        description: trip.description,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        startPoint: trip.startPoint || '',
        start: trip.startPoint || '',
        createdBy: trip.createdBy,
        members: [trip.createdBy ? `${trip.createdBy.firstName} ${trip.createdBy.lastName}` : 'Unknown'],
        shareCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
        places: [],
        tasks: [],
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt
      }));

      setTrips(transformedTrips);
      console.log('Fetched trips:', transformedTrips);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const voteForPin = (pinId, voteType) => {
    if (currentTrip && currentUser) {
      const pins = customPins[currentTrip.id] || [];
      const updatedPins = pins.map(pin => {
        if (pin.id === pinId) {
          const likes = pin.likes || [];
          const dislikes = pin.dislikes || [];
          const hasLiked = likes.includes(currentUser.name);
          const hasDisliked = dislikes.includes(currentUser.name);

          if (voteType === 'like') {
            if (hasLiked) {
              return {
                ...pin,
                likes: likes.filter(user => user !== currentUser.name)
              };
            } else {
              return {
                ...pin,
                likes: [...likes, currentUser.name],
                dislikes: dislikes.filter(user => user !== currentUser.name)
              };
            }
          } else if (voteType === 'dislike') {
            if (hasDisliked) {
              return {
                ...pin,
                dislikes: dislikes.filter(user => user !== currentUser.name)
              };
            } else {
              return {
                ...pin,
                dislikes: [...dislikes, currentUser.name],
                likes: likes.filter(user => user !== currentUser.name)
              };
            }
          }
        }
        return pin;
      });

      setCustomPins({
        ...customPins,
        [currentTrip.id]: updatedPins,
      });
    }
  };

  const addCustomPin = (pin) => {
    if (currentTrip && currentUser) {
      const pins = customPins[currentTrip.id] || [];
      setCustomPins({
        ...customPins,
        [currentTrip.id]: [...pins, { ...pin, likes: [], dislikes: [] }],
      });
    }
  };

  const deleteCustomPin = (pinId) => {
    if (currentTrip) {
      const pins = customPins[currentTrip.id] || [];
      setCustomPins({
        ...customPins,
        [currentTrip.id]: pins.filter(p => p.id !== pinId),
      });
    }
  };

  const updateCustomPin = (index, updatedPin) => {
    if (currentTrip) {
      const pins = [...(customPins[currentTrip.id] || [])];
      if (pins[index]) {
        pins[index] = {
          ...pins[index],
          x: updatedPin.x,
          y: updatedPin.y,
        };
        setCustomPins({
          ...customPins,
          [currentTrip.id]: pins,
        });
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedPin(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedPin === null || draggedPin === dropIndex) {
      setDraggedPin(null);
      setDragOverIndex(null);
      return;
    }

    if (currentTrip) {
      const currentPins = customPins[currentTrip.id] || [];
      const newPins = [...currentPins];
      const [movedPin] = newPins.splice(draggedPin, 1);
      newPins.splice(dropIndex, 0, movedPin);

      const reorderedPins = newPins.map(pin => ({
        ...pin,
        x: undefined,
        y: undefined
      }));

      setCustomPins({
        ...customPins,
        [currentTrip.id]: reorderedPins,
      });

      setMapKey(prev => prev + 1);
    }

    setDraggedPin(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    console.log('CustomPins updated in map:', customPins);
  }, [customPins]);

  const inviteMember = () => {
    if (inviteEmail && currentTrip) {
      const currentMembers = tripInvites[currentTrip.id] || [];
      if (!currentMembers.includes(inviteEmail)) {
        const updated = {
          ...currentTrip,
          members: [...currentTrip.members, inviteEmail],
        };
        setCurrentTrip(updated);
        setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
        setTripInvites({
          ...tripInvites,
          [currentTrip.id]: [...currentMembers, inviteEmail],
        });
        setInviteEmail('');
      }
    }
  };

  const removeMember = (email) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        members: currentTrip.members.filter(m => m !== email),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
      const currentMembers = tripInvites[currentTrip.id] || [];
      setTripInvites({
        ...tripInvites,
        [currentTrip.id]: currentMembers.filter(m => m !== email),
      });
    }
  };

  const generateShareLink = () => {
    if (currentTrip) {
      const link = `${window.location.origin}?trip=${currentTrip.shareCode}`;
      setShareLink(link);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTrip(null);
    setTrips([]);
    AuthAPI.logout();
    onLogoutToHome();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TripSync</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Collaborative trip planning</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentTrip && (
                <button
                  onClick={() => setCurrentTrip(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  All Trips
                </button>
              )}
              {currentUser && (
                <ProfileComponent
                  currentUser={currentUser.name}
                  userEmail={currentUser.email}
                  tripsCreated={trips.filter(t => t.createdBy?.id === currentUser.id).length}
                  tripsJoined={trips.length}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentTrip ? (
          <div className="mt-4">
            <TripCreationAutocomplete
              onCreateTrip={async (tripData) => {
                console.log('Trip created, refreshing list...');
                await fetchUserAndTrips();

                const allTrips = await TripsAPI.getAllTrips();
                const newTrip = allTrips.find(t => t.name === tripData.name);
                if (newTrip) {
                  const transformedTrip = {
                    id: newTrip.id,
                    name: newTrip.name,
                    description: newTrip.description,
                    destination: newTrip.destination,
                    startDate: newTrip.startDate,
                    endDate: newTrip.endDate,
                    startPoint: tripData.start || '',
                    start: tripData.start || '',
                    startCoords: tripData.startCoords,
                    destCoords: tripData.destCoords,
                    createdBy: newTrip.createdBy,
                    members: [currentUser?.name || 'You'],
                    shareCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
                    places: [],
                    tasks: [],
                  };
                  setCurrentTrip(transformedTrip);
                  setCustomPins({ ...customPins, [transformedTrip.id]: [] });
                  setCurrentTab('map');
                }
              }}
              existingTrips={trips}
              onSelectTrip={setCurrentTrip}
              currentUser={currentUser}
              userEmail={currentUser?.email}
              onTripsUpdate={fetchUserAndTrips}
            />
          </div>
        ) : (
          <div>
            {/* Trip Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-indigo-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTrip.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                        {currentTrip.startPoint && (
                          <>
                            <span className="font-medium text-gray-900">{currentTrip.startPoint}</span>
                            <span className="text-gray-400">→</span>
                          </>
                        )}
                        <span className="font-medium text-gray-900">{currentTrip.destination}</span>
                      </div>
                      {currentTrip.description && (
                        <p className="text-gray-600 text-sm mb-2">{currentTrip.description}</p>
                      )}
                      {currentTrip.startDate && currentTrip.endDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span>
                            {new Date(currentTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 flex-shrink-0"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Invite</span>
                </button>
              </div>

              {/* Members Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    {currentTrip.members.length} {currentTrip.members.length === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTrip.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {member === currentUser?.name ? member + ' (You)' : member}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Invite to Trip</h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Email Invite */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && inviteMember()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={inviteMember}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Invited Members */}
                  {currentTrip && tripInvites[currentTrip.id] && tripInvites[currentTrip.id].length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Invited ({tripInvites[currentTrip.id].length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tripInvites[currentTrip.id].map((email, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm text-gray-700">{email}</span>
                            <button
                              onClick={() => removeMember(email)}
                              className="text-gray-400 hover:text-red-600 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="mb-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share Link
                    </label>
                    <button
                      onClick={generateShareLink}
                      className="w-full mb-3 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} />
                      Generate Share Link
                    </button>
                    {shareLink && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-2">Share this link:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded text-gray-700"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition flex items-center gap-1"
                          >
                            <Copy size={14} />
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-8 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setCurrentTab('map')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'map'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <MapPin className="inline mr-2" size={16} />
                  Map
                </button>
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'tasks'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <ClipboardList className="inline mr-2" size={16} />
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentTab('expenses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'expenses'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <DollarSign className="inline mr-2" size={16} />
                  Expenses
                </button>
                <button
                  onClick={() => setCurrentTab('itinerary')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'itinerary'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Calendar className="inline mr-2" size={16} />
                  Itinerary
                </button>
              </nav>
            </div>

            {/* Trip Map Tab */}
            {currentTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Pins */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-indigo-600" />
                      Places
                    </h3>

                    {/* Route Info */}
                    {currentTrip.startPoint && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <p className="text-xs font-medium text-green-700 mb-1">START</p>
                        <p className="text-sm font-semibold text-gray-900">{currentTrip.startPoint}</p>
                      </div>
                    )}

                    {/* Custom Pins Section - Draggable */}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="space-y-2 my-3">
                        {(customPins[currentTrip.id] || []).map((pin, idx) => (
                          <div
                            key={pin.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`p-3 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-sm transition cursor-move ${dragOverIndex === idx ? 'border-purple-400 border-dashed shadow-md' : ''
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="flex items-start gap-2 flex-1">
                                <GripVertical size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{pin.name}</p>
                                  {pin.description && (
                                    <p className="text-gray-600 text-xs mt-1">{pin.description}</p>
                                  )}
                                </div>
                              </div>
                              {currentUser?.name === pin.addedBy && (
                                <button
                                  onClick={() => deleteCustomPin(pin.id)}
                                  className="text-gray-400 hover:text-red-600 rounded p-1 transition"
                                  title="Delete pin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                            {/* Vote Buttons */}
                            <div className="flex gap-2 mb-2">
                              <button
                                onClick={() => voteForPin(pin.id, 'like')}
                                className={`flex-1 px-2 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-medium ${(pin.likes || []).includes(currentUser?.name)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                                  }`}
                              >
                                <ThumbsUp size={12} />
                                <span>{(pin.likes || []).length}</span>
                              </button>
                              <button
                                onClick={() => voteForPin(pin.id, 'dislike')}
                                className={`flex-1 px-2 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-medium ${(pin.dislikes || []).includes(currentUser?.name)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50'
                                  }`}
                              >
                                <ThumbsDown size={12} />
                                <span>{(pin.dislikes || []).length}</span>
                              </button>
                            </div>

                            <div className="text-gray-600 border-t border-purple-200 pt-2 space-y-1">
                              <p className="text-xs">Added by: <span className="font-medium">{pin.addedBy}</span></p>
                              <p className="text-xs text-gray-500">{pin.address}</p>
                              {((pin.likes || []).length > 0 || (pin.dislikes || []).length > 0) && (
                                <div className="mt-2 text-xs space-y-1">
                                  {(pin.likes || []).length > 0 && (
                                    <p className="text-green-600">
                                      Liked by: {(pin.likes || []).join(', ')}
                                    </p>
                                  )}
                                  {(pin.dislikes || []).length > 0 && (
                                    <p className="text-red-600">
                                      Disliked by: {(pin.dislikes || []).join(', ')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-700 mb-1">DESTINATION</p>
                      <p className="text-sm font-semibold text-gray-900">{currentTrip.destination}</p>
                    </div>

                    {/* Info Text */}
                    {(customPins[currentTrip.id] || []).length === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          Click on the map to add places
                        </p>
                      </div>
                    )}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          Drag to reorder stops
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Right Side - Interactive Map */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="relative w-full h-96 lg:h-full min-h-96">
                    <InteractiveMapComponent
                      key={mapKey}
                      startPoint={currentTrip.startPoint}
                      destination={currentTrip.destination}
                      stops={[]}
                      customPins={customPins[currentTrip.id] || []}
                      onAddPin={addCustomPin}
                      onUpdatePin={updateCustomPin}
                      currentUser={currentUser?.name}
                      startCoordinates={currentTrip.startCoords}
                      destCoordinates={currentTrip.destCoords}
                    />
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Route:</span> {currentTrip.startPoint || 'Your location'} → {currentTrip.destination}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {currentTab === 'tasks' && (
              <TaskTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpenseTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {currentTab === 'itinerary' && (
              <ItineraryTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}