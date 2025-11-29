import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, MapPin, Navigation, Sparkles, ArrowRight, Calendar, Trash2, Edit2 } from 'lucide-react';
import { TripsAPI, InviteAPI} from './apiService';
import EditTripModal from './EditTripModal';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyYWRkaGEtc2hpbmRlIiwiYSI6ImNtZ29mbnA5azF1dmsybm9rYnk1d29tNHUifQ.WggehwJ0oUYLhFR8mzVnnQ';

export default function TripCreationAutocomplete({ onCreateTrip, existingTrips = [], onSelectTrip, currentUser, userEmail, onTripsUpdate }) {
  const [newTripName, setNewTripName] = useState('');
  const [newTripDescription, setNewTripDescription] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripDest, setNewTripDest] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingTrip, setEditingTrip] = useState(null);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripParticipants, setTripParticipants] = useState({});
  

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const startTimeoutRef = useRef(null);
  const destTimeoutRef = useRef(null);

  const searchPlaces = async (query, type) => {
    if (!query.trim() || query.length < 2) {
      if (type === 'start') {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
      return;
    }

    const setLoading = type === 'start' ? setLoadingStart : setLoadingDest;
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,region`
      );
      const data = await response.json();

      const suggestions = data.features?.map((place) => ({
        name: place.place_name,
        shortName: place.text,
        id: place.id,
        coordinates: place.geometry.coordinates
      })) || [];

      if (type === 'start') {
        setStartSuggestions(suggestions);
        setShowStartSuggestions(suggestions.length > 0);
      } else {
        setDestSuggestions(suggestions);
        setShowDestSuggestions(suggestions.length > 0);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrip = async (tripId, updateData) => {
    try {
      console.log('Updating trip:', tripId, updateData);
      await TripsAPI.updateTrip(tripId, updateData);
      console.log('Trip updated successfully');

      if (onTripsUpdate) {
        await onTripsUpdate();
      }
    } catch (err) {
      console.error('Error updating trip:', err);
      throw err;
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      console.log('Deleting trip:', tripId);
      await TripsAPI.deleteTrip(tripId);
      console.log('Trip deleted successfully');

      setShowDeleteConfirm(false);
      setDeletingTripId(null);

      if (onTripsUpdate) {
        await onTripsUpdate();
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    setNewTripStart(value);

    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'start');
    }, 300);
  };

  const handleDestChange = (e) => {
    const value = e.target.value;
    setNewTripDest(value);

    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
    destTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'dest');
    }, 300);
  };

  const handleSelectStart = (place) => {
    setNewTripStart(place.name);
    setStartCoords(place.coordinates);
    setShowStartSuggestions(false);
    setStartSuggestions([]);
  };

  const handleSelectDest = (place) => {
    setNewTripDest(place.name);
    setDestCoords(place.coordinates);
    setShowDestSuggestions(false);
    setDestSuggestions([]);
  };

  const handleCreateTrip = async () => {
    setError('');

    if (!newTripName.trim()) {
  setError('Please enter a trip name');
  return;
}
if (!newTripStart.trim()) {
  setError('Please enter a starting point');
  return;
}
if (!newTripDest.trim()) {
  setError('Please enter a destination');
  return;
}
    if (!startDate) {
      setError('Please select a start date');
      return;
    }
    if (!endDate) {
      setError('Please select an end date');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    setCreating(true);

    try {
      const tripData = {
        name: newTripName,
        description: newTripDescription || `Trip from ${newTripStart || 'Your location'} to ${newTripDest}`,
        destination: newTripDest,
        startingPoint: newTripStart || null,
        startDate: startDate,
        endDate: endDate,
        startLatitude: startCoords ? startCoords[1] : null,
        startLongitude: startCoords ? startCoords[0] : null,
        destinationLatitude: destCoords ? destCoords[1] : null,
        destinationLongitude: destCoords ? destCoords[0] : null,
      };

      const createdTrip = await TripsAPI.createTrip(tripData);

      const transformedTrip = {
        id: createdTrip.id,
        name: createdTrip.name,
        description: createdTrip.description,
        start: newTripStart,
        startPoint: newTripStart,
        destination: createdTrip.destination,
        startDate: createdTrip.startDate,
        endDate: createdTrip.endDate,
        startCoords: startCoords,
        destCoords: destCoords,
        createdBy: createdTrip.createdBy,
        members: [currentUser?.name || 'You']
      };

      onCreateTrip(transformedTrip);

      setNewTripName('');
      setNewTripDescription('');
      setNewTripStart('');
      setNewTripDest('');
      setStartDate('');
      setEndDate('');
      setStartCoords(null);
      setDestCoords(null);

    } catch (err) {
      console.error('Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  useEffect(() => {
  const loadAllParticipants = async () => {
    for (const trip of existingTrips) {
      try {
        const participants = await InviteAPI.getTripParticipants(trip.id);
        setTripParticipants(prev => ({
          ...prev,
          [trip.id]: participants
        }));
      } catch (error) {
        console.error('Error loading participants for trip', trip.id, error);
      }
    }
  };
  
  if (existingTrips.length > 0) {
    loadAllParticipants();
  }
}, [existingTrips]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Trip Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 rounded-lg p-2">
                <Plus className="text-indigo-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Create New Trip</h2>
            </div>

            <div className="space-y-4">
              {/* Trip Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trip Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Road Trip 2025"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Tell us about your trip..."
                  value={newTripDescription}
                  onChange={(e) => setNewTripDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Starting Point with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Starting Point *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Boulder, Colorado"
                    value={newTripStart}
                    onChange={handleStartChange}
                    onFocus={() => newTripStart && setShowStartSuggestions(true)}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />

                  {showStartSuggestions && startSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
                      {startSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSelectStart(suggestion)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="text-gray-400 flex-shrink-0" size={14} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{suggestion.shortName}</p>
                              <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {loadingStart && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                        <p className="text-sm text-gray-600">Searching...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Destination *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Bali, Indonesia"
                    value={newTripDest}
                    onChange={handleDestChange}
                    onFocus={() => newTripDest && setShowDestSuggestions(true)}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />

                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
                      {destSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSelectDest(suggestion)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="text-gray-400 flex-shrink-0" size={14} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{suggestion.shortName}</p>
                              <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {loadingDest && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                        <p className="text-sm text-gray-600">Searching...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Visual Route Indicator */}
              {(newTripStart || newTripDest) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {newTripStart && (
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                        <Navigation className="text-green-600" size={14} />
                        <span className="font-medium text-green-700 truncate max-w-32">
                          {newTripStart.split(',')[0]}
                        </span>
                      </div>
                    )}
                    {newTripStart && newTripDest && <ArrowRight className="text-gray-400" size={16} />}
                    {newTripDest && (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                        <MapPin className="text-red-600" size={14} />
                        <span className="font-medium text-red-700 truncate max-w-32">
                          {newTripDest.split(',')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
  onClick={handleCreateTrip}
  disabled={creating || !newTripName || !newTripStart || !newTripDest || !startDate || !endDate}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Trip
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Your Trips */}
          <div>
            {existingTrips.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <MapPin className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Trips</h3>
                </div>

                <div className="space-y-3">
                  {existingTrips.map((trip) => (
                    <div key={trip.id} className="relative group">
                      <button
                        onClick={() => onSelectTrip(trip)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all text-left bg-white"
                      >
                        <div className="mb-3">
                          <h4 className="font-semibold text-base text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                            {trip.name}
                          </h4>
                          {trip.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            {trip.start && (
                              <>
                                <div className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                                  <Navigation className="text-green-600" size={12} />
                                  <span className="text-green-700 text-xs font-medium truncate max-w-24">
                                    {trip.start.split(',')[0] || trip.start}
                                  </span>
                                </div>
                                <ArrowRight className="text-gray-400" size={14} />
                              </>
                            )}
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              <MapPin className="text-red-600" size={12} />
                              <span className="text-red-700 text-xs font-medium truncate max-w-24">
                                {trip.destination?.split(',')[0] || trip.destination}
                              </span>
                            </div>
                          </div>

                          {trip.startDate && trip.endDate && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {tripParticipants[trip.id] && tripParticipants[trip.id].length > 0 && (
  <div className="mt-3 pt-3 border-t border-gray-100">
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">
        {tripParticipants[trip.id].length} {tripParticipants[trip.id].length === 1 ? 'member' : 'members'}
      </span>
      <div className="flex -space-x-1.5">
        {tripParticipants[trip.id].slice(0, 3).map((participant, idx) => {
          const initials = `${participant.firstName?.charAt(0) || ''}${participant.lastName?.charAt(0) || ''}`.toUpperCase();
          return (
            <div
              key={participant.id}
              className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
              title={`${participant.firstName} ${participant.lastName}`}
            >
              <span className="text-xs font-semibold text-indigo-600">
                {initials}
              </span>
            </div>
          );
        })}
        {tripParticipants[trip.id].length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">
              +{tripParticipants[trip.id].length - 3}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
)}
                      </button>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTrip(trip);
                          }}
                          className="bg-white border border-gray-300 text-gray-700 px-2.5 py-1 rounded hover:bg-gray-50 text-xs font-medium shadow-sm flex items-center gap-1"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>

                        {/* Only show delete button if current user is the creator */}
                        {trip.createdBy?.id === currentUser?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTripId(trip.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="bg-white border border-gray-300 text-red-600 px-2.5 py-1 rounded hover:bg-red-50 text-xs font-medium shadow-sm flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <MapPin className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-sm text-gray-600">
                  Create your first trip to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingTripId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-lg p-2">
                  <Trash2 className="text-red-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Trip?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete "<span className="font-semibold">
                  {existingTrips.find(t => t.id === deletingTripId)?.name}
                </span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingTripId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTrip(deletingTripId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Trip Modal */}
        {editingTrip && (
          <EditTripModal
            trip={editingTrip}
            onClose={() => setEditingTrip(null)}
            onUpdate={handleUpdateTrip}
          />
        )}
      </div>
    </div>
  );
}