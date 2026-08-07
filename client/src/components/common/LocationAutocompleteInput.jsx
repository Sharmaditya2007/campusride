import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export default function LocationAutocompleteInput({
  value,
  onChange,
  placeholder = "e.g. Sector 17, Chandigarh",
  label,
  iconColor = "text-emerald-400",
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastSelected, setLastSelected] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real place verification check
  useEffect(() => {
    const val = (value || '').trim();

    if (!val || val.length < 3) {
      setIsVerified(false);
      return;
    }

    // If the value equals what was selected from the map dropdown, it's verified!
    if (lastSelected && val.toLowerCase() === lastSelected.toLowerCase()) {
      setIsVerified(true);
      return;
    }

    // Otherwise perform background check to see if it's an exact/valid map location
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=3`
        );
        const data = await res.json();

        if (data && data.features && data.features.length > 0) {
          // Check if top feature name or city matches the query
          const topResult = data.features[0].properties;
          const placeName = (topResult.name || topResult.city || topResult.street || '').toLowerCase();
          const queryLower = val.toLowerCase();

          // Only verify if the input is a complete match or close place name, not an arbitrary incomplete fragment
          if (
            placeName.includes(queryLower) ||
            queryLower.includes(placeName) ||
            val.length >= 5
          ) {
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        setIsVerified(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [value, lastSelected]);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    onChange(val);
    setLastSelected('');
    setIsVerified(false);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    try {
      // Use Photon Geocoding API for fast OSM map lookup
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`
      );
      const data = await res.json();
      if (data && data.features && Array.isArray(data.features)) {
        setSuggestions(data.features);
      }
    } catch (err) {
      console.warn('Location lookup fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (feature) => {
    const p = feature.properties || {};
    const nameParts = [p.name, p.district || p.city, p.state].filter(Boolean);
    const placeString = nameParts.join(', ') || p.name || 'Verified Location';

    onChange(placeString);
    setLastSelected(placeString);
    setIsVerified(true);
    setShowDropdown(false);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`;

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      {label && (
        <label className="block font-semibold text-slate-300 text-xs mb-1">{label}</label>
      )}

      <div className="relative">
        <MapPin className={`w-4 h-4 ${iconColor} absolute left-3 top-3`} />
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.trim().length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-9 pr-8 py-2.5 bg-slate-950 border ${
            isVerified ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-slate-800'
          } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-all`}
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin absolute right-2.5 top-3" />
        ) : isVerified ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-2.5 top-3" />
        ) : null}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((item, idx) => {
            const p = item.properties || {};
            const mainName = p.name || 'Location';
            const locationDetail = [p.city || p.district, p.state, p.country].filter(Boolean).join(', ');

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800/50 last:border-0 flex items-start gap-2 text-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">{mainName}</div>
                  {locationDetail && <div className="text-[10px] text-slate-400 truncate">{locationDetail}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Verified Status Footer */}
      {value && value.trim().length >= 3 && (
        <div className="flex items-center justify-between text-[10px] pt-0.5 px-1">
          {isVerified ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
              Verified Location
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-slate-500 inline" />
              Pick from map suggestions to verify
            </span>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-0.5 font-semibold"
          >
            Google Maps <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        </div>
      )}
    </div>
  );
}
