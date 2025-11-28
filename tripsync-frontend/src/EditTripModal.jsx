import React, { useState, useRef } from 'react';
import { X, MapPin, Navigation, Sparkles, Calendar, Save, ArrowRight } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyYWRkaGEtc2hpbmRlIiwiYSI6ImNtZ29mbnA5azF1dmsybm9rYnk1d29tNHUifQ.WggehwJ0oUYLhFR8mzVnnQ';

export default function EditTripModal({ trip, onClose, onUpdate }) {
  const [tripName, setTripName] = useState(trip.name);
  const [tripDescription, setTripDescription] = useState(trip.description || '');
  const [tripStart, setTripStart] = useState(trip.startPoint || trip.start || '');
  const [tripDest, setTripDest] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(trip.endDate?.split('T')[0] || '');
  
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [startCoords, setStartCoords] = useState(trip.startCoords || null);
  const [destCoords, setDestCoords] = useState(trip.destCoords || null);

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

  const handleStartChange = (e) => {
    const value = e.target.value;
    setTripStart(value);

    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'start');
    }, 300);
  };

  const handleDestChange = (e) => {
    const value = e.target.value;
    setTripDest(value);

    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
    destTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'dest');
    }, 300);
  };

  const handleSelectStart = (place) => {
    setTripStart(place.name);
    setStartCoords(place.coordinates);
    setShowStartSuggestions(false);
    setStartSuggestions([]);
  };

  const handleSelectDest = (place) => {
    setTripDest(place.name);
    setDestCoords(place.coordinates);
    setShowDestSuggestions(false);
    setDestSuggestions([]);
  };

  const handleUpdateTrip = async () => {
    setError('');
    
    // Validation
    if (!tripName.trim()) {
  setError('Please enter a trip name');
  return;
}
if (!tripStart.trim()) {
  setError('Please enter a starting point');
  return;
}
if (!tripDest.trim()) {
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

    setUpdating(true);

    try {
      const updateData = {
  name: tripName,
  description: tripDescription,
  destination: tripDest,
  startingPoint: tripStart,
  startDate: startDate,
  endDate: endDate,
  // Add coordinates if available
  startLatitude: startCoords ? startCoords[1] : null,
  startLongitude: startCoords ? startCoords[0] : null,
  destinationLatitude: destCoords ? destCoords[1] : null,
  destinationLongitude: destCoords ? destCoords[0] : null,
};
      
      // Pass both trip ID and update data to the parent handler
      await onUpdate(trip.id, updateData);
      onClose();
    } catch (err) {
      console.error('Error updating trip:', err);
      setError('Failed to update trip. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 rounded-lg p-2.5">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Edit Trip</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Trip Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trip Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Summer Road Trip 2025"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
              />
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Tell us about your trip..."
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
              rows={3}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 resize-none"
            />
          </div>

          {/* Starting Point with Autocomplete */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Starting Point *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Boulder, Colorado"
                value={tripStart}
                onChange={handleStartChange}
                onFocus={() => tripStart && setShowStartSuggestions(true)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 rounded-full p-1">
                <Navigation className="text-green-600" size={16} />
              </div>
              
              {showStartSuggestions && startSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 max-h-64 overflow-y-auto">
                  {startSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectStart(suggestion)}
                      className="w-full text-left px-5 py-4 hover:bg-green-50 border-b last:border-b-0 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-lg p-2 group-hover:bg-green-200 transition-colors">
                          <MapPin className="text-green-600" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                          <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {loadingStart && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <p className="text-sm text-gray-600">Searching locations...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Destination with Autocomplete */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Bali, Indonesia"
                value={tripDest}
                onChange={handleDestChange}
                onFocus={() => tripDest && setShowDestSuggestions(true)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-100 rounded-full p-1">
                <MapPin className="text-red-600" size={16} />
              </div>
              
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 max-h-64 overflow-y-auto">
                  {destSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectDest(suggestion)}
                      className="w-full text-left px-5 py-4 hover:bg-red-50 border-b last:border-b-0 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 rounded-lg p-2 group-hover:bg-red-200 transition-colors">
                          <MapPin className="text-red-600" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                          <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {loadingDest && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    <p className="text-sm text-gray-600">Searching locations...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          </div>

          {/* Visual Route Indicator */}
          {(tripStart || tripDest) && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-3 text-sm">
                {tripStart && (
                  <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                    <Navigation className="text-green-600" size={16} />
                    <span className="font-semibold text-green-800 truncate max-w-32">
                      {tripStart.split(',')[0]}
                    </span>
                  </div>
                )}
                {tripStart && tripDest && <ArrowRight className="text-indigo-600" size={20} />}
                {tripDest && (
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
                    <MapPin className="text-red-600" size={16} />
                    <span className="font-semibold text-red-800 truncate max-w-32">
                      {tripDest.split(',')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTrip}
              disabled={updating || !tripName || !tripStart || !tripDest || !startDate || !endDate}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
            >
              {updating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}