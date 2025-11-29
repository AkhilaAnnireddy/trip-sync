import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search } from 'lucide-react';

export const InteractiveMapComponent = ({
  startPoint,
  destination,
  customPins,
  onAddPin,
  currentUser,
  startCoordinates,
  destCoordinates,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const startMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchPosition, setSearchPosition] = useState({ lat: 0, lng: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [pinData, setPinData] = useState({ name: '', description: '' });
  const [hoveredPin, setHoveredPin] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const popupPositionRef = useRef({ x: 0, y: 0 });

  const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyYWRkaGEtc2hpbmRlIiwiYSI6ImNtZ29mbnA5azF1dmsybm9rYnk1d29tNHUifQ.WggehwJ0oUYLhFR8mzVnnQ';
  useEffect(() => {
    if (!window.mapboxgl) {
      console.error('Mapbox GL JS not loaded');
      return;
    }

    window.mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new window.mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

    map.on('dblclick', (e) => {
      setSearchPosition({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setShowSearchModal(true);
      setSelectedPlace(null);
      setPinData({ name: '', description: '' });
      setSearchQuery('');
      setSearchResults([]);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
  if (!startCoordinates && !destCoordinates) return;

    if (startMarkerRef.current) startMarkerRef.current.remove();
    if (destMarkerRef.current) destMarkerRef.current.remove();

    const startEl = document.createElement('div');
    startEl.className = 'start-marker';
    startEl.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: #10b981;
    border: 4px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    z-index: 10;
  `;
    startEl.innerHTML = '🏁';

    startEl.addEventListener('mouseenter', (e) => {
      const rect = startEl.getBoundingClientRect();
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      popupPositionRef.current = {
        x: rect.left + rect.width / 2 - mapRect.left,
        y: rect.top - mapRect.top
      };
      startEl.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.6)';
      startEl.style.zIndex = '30';
      setHoveredPin('start');
    });

    startEl.addEventListener('mouseleave', () => {
      startEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
      startEl.style.zIndex = '10';
      setHoveredPin(null);
    });

    startMarkerRef.current = new window.mapboxgl.Marker(startEl)
      .setLngLat(startCoordinates)
      .addTo(mapRef.current);

    const destEl = document.createElement('div');
    destEl.className = 'dest-marker';
    destEl.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: #ef4444;
    border: 4px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    z-index: 10;
  `;
    destEl.innerHTML = '🎯';

    destEl.addEventListener('mouseenter', (e) => {
      const rect = destEl.getBoundingClientRect();
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      popupPositionRef.current = {
        x: rect.left + rect.width / 2 - mapRect.left,
        y: rect.top - mapRect.top
      };
      destEl.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.6)';
      destEl.style.zIndex = '30';
      setHoveredPin('destination');
    });

    destEl.addEventListener('mouseleave', () => {
      destEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
      destEl.style.zIndex = '10';
      setHoveredPin(null);
    });

    destMarkerRef.current = new window.mapboxgl.Marker(destEl)
      .setLngLat(destCoordinates)
      .addTo(mapRef.current);

    const bounds = new window.mapboxgl.LngLatBounds();

if (startCoordinates) {
  bounds.extend(startCoordinates);
}
if (destCoordinates) {
  bounds.extend(destCoordinates);
}

customPins.forEach(pin => {
  bounds.extend([pin.lng, pin.lat]);
});

// Only fit bounds if we have at least one coordinate
if (startCoordinates || destCoordinates || customPins.length > 0) {
  mapRef.current.fitBounds(bounds, { padding: 100 });
}

  }, [startCoordinates, destCoordinates, startPoint, destination]);

  const pinsKey = useMemo(() =>
    customPins.map(p => `${p.id}-${p.lat}-${p.lng}-${p.name}`).join('|'),
    [customPins]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    customPins.forEach((pin, idx) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: #6366f1;
    border: 3px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
    z-index: 10;
  `;
      el.textContent = idx + 1;
      el.title = pin.name;

      el.addEventListener('mouseenter', (e) => {
        const rect = el.getBoundingClientRect();
        const mapRect = mapContainerRef.current.getBoundingClientRect();
        popupPositionRef.current = {
          x: rect.left + rect.width / 2 - mapRect.left,
          y: rect.top - mapRect.top
        };
        el.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.6)';
        el.style.zIndex = '30';
        setHoveredPin(idx);
      });
      el.addEventListener('mouseleave', () => {
        el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        el.style.zIndex = '10';
        setHoveredPin(null);
      });

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([pin.lng, pin.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    if (customPins.length > 0 || startCoordinates || destCoordinates) {
      const bounds = new window.mapboxgl.LngLatBounds();

      if (startCoordinates) {
        bounds.extend(startCoordinates);
      }
      if (destCoordinates) {
        bounds.extend(destCoordinates);
      }

      customPins.forEach(pin => {
        bounds.extend([pin.lng, pin.lat]);
      });

      mapRef.current.fitBounds(bounds, { padding: 100 });
    }
  }, [pinsKey, startCoordinates, destCoordinates]);

useEffect(() => {
  if (!mapRef.current) return;
  
  const map = mapRef.current;

  const addRouteLines = () => {
    try {
      // Remove existing layers and sources
      if (map.getLayer('route-line')) {
        map.removeLayer('route-line');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }

      // Build route coordinates - filter out any null/undefined
      const routeCoordinates = [
        startCoordinates,
        ...customPins.map(pin => [pin.lng, pin.lat]),
        destCoordinates
      ].filter(coord => coord && coord.length === 2);

      // Only draw if we have at least 2 points
      if (routeCoordinates.length < 2) {
        console.log('Not enough coordinates to draw route');
        return;
      }

      console.log('Drawing route with coordinates:', routeCoordinates);

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#6366f1',
          'line-width': 5,
          'line-opacity': 0.9
        }
      });

      console.log('✅ Route line added successfully');

    } catch (error) {
      console.error('❌ Error adding route lines:', error);
    }
  };

  if (!map.isStyleLoaded()) {
    map.once('load', () => {
      setTimeout(addRouteLines, 200);
    });
  } else {
    setTimeout(addRouteLines, 200);
  }

  return () => {
    try {
      if (map.getLayer('route-line')) {
        map.removeLayer('route-line');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  };
}, [startCoordinates, destCoordinates, pinsKey]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const hasNumbers = /\d/.test(searchQuery);

      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        limit: '10',
        autocomplete: 'false',
      });

      if (hasNumbers) {
        params.append('types', 'address,poi');
      } else {
        params.append('types', 'poi,place,address');
      }

      if (!hasNumbers && searchPosition) {
        params.append('proximity', `${searchPosition.lng},${searchPosition.lat}`);
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${params}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setSearchResults(data.features.map(feature => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          lat: feature.center[1],
          lng: feature.center[0],
          category: feature.properties.category || feature.place_type[0],
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchPosition]);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setPinData({
      name: place.name,
      description: place.address,
    });

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 14,
      });
    }
  };

  const handleAddPin = () => {
    if (!selectedPlace || !pinData.name.trim()) {
      alert('Please search and select a place');
      return;
    }

    const newPin = {
      id: Date.now(),
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      name: pinData.name.trim(),
      description: pinData.description.trim() || selectedPlace.address,
      address: selectedPlace.address,
      category: selectedPlace.category,
      addedBy: currentUser,
      timestamp: new Date().toLocaleString(),
    };

    onAddPin(newPin);

    setShowSearchModal(false);
    setSelectedPlace(null);
    setPinData({ name: '', description: '' });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-xl shadow-2xl"
        style={{ minHeight: '500px' }}
      />

      {hoveredPin !== null && (
        <div
          className="absolute bg-white rounded-xl shadow-2xl p-4 border-2 border-indigo-400 max-w-sm z-20 pointer-events-none"
          style={{
            left: `${popupPositionRef.current.x}px`,
            top: `${popupPositionRef.current.y - 10}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {hoveredPin === 'start' ? (
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">🏁</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900 mb-1">
                  Start Point
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {startPoint}
                </div>
                <div className="text-xs text-green-600 font-semibold">
                  📍 Your journey begins here
                </div>
              </div>
            </div>
          ) : hoveredPin === 'destination' ? (
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900 mb-1">
                  Destination
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {destination}
                </div>
                <div className="text-xs text-red-600 font-semibold">
                  📍 Your final destination
                </div>
              </div>
            </div>
          ) : customPins[hoveredPin] ? (
            <>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">📍</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 mb-1">
                    {customPins[hoveredPin].name}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {customPins[hoveredPin].description}
                  </div>
                  {customPins[hoveredPin].category && (
                    <div className="text-xs text-indigo-600 font-semibold">
                      📂 {customPins[hoveredPin].category}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Added by:</span> {customPins[hoveredPin].addedBy}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {customPins[hoveredPin].timestamp}
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}

      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Search size={24} className="text-indigo-600" />
                Search Place
              </h3>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSelectedPlace(null);
                  setPinData({ name: '', description: '' });
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search for a place *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && !selectedPlace && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Select a place:</p>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectPlace(result)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                    >
                      <p className="text-sm font-semibold text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{result.address}</p>
                      {result.category && (
                        <p className="text-xs text-indigo-600 mt-1">📂 {result.category}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedPlace && (
                <>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">
                      ✓ {selectedPlace.name}
                    </p>
                    <p className="text-xs text-indigo-700">
                      📍 {selectedPlace.address}
                    </p>
                    {selectedPlace.category && (
                      <p className="text-xs text-indigo-600 mt-1">
                        📂 {selectedPlace.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Override place name"
                      value={pinData.name}
                      onChange={(e) => setPinData({ ...pinData, name: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      placeholder="Add notes about this place"
                      value={pinData.description}
                      onChange={(e) => setPinData({ ...pinData, description: e.target.value })}
                      rows="3"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                <p className="text-gray-700">
                  <strong>Added by:</strong> {currentUser}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPin}
                  disabled={!selectedPlace}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${selectedPlace
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Add Place
                </button>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSelectedPlace(null);
                    setPinData({ name: '', description: '' });
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};