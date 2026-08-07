import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, ExternalLink, Compass, Navigation, Loader2 } from 'lucide-react';

const POPULAR_LOCATIONS = [
  'Mohali Phase 7 (Near Metro Gate), Mohali',
  'Mohali Sector 70, Mohali',
  'Mohali Phase 3B2, Mohali',
  'Kharar Flyover Exit, Kharar',
  'Landran Chowk, Mohali',
  'Sector 17 Bus Stand, Chandigarh',
  'Tribune Chowk, Chandigarh',
  'Sector 43 ISBT, Chandigarh',
  'Chandigarh Railway Station, Chandigarh',
  'Panjab University Gate 1, Chandigarh',
  'PEC Punjab Engineering College Gate, Chandigarh',
  'Panchkula Sector 5, Panchkula',
  'Panchkula Sector 11, Panchkula',
  'Panchkula Bus Stand, Panchkula',
  'Zirakpur Flyover Junction, Zirakpur',
  'Chitkara University Campus Gate 1, Rajpura',
  'Chitkara University Campus Gate 2, Rajpura',
  'Chitkara University Himachal Campus, Barotiwala',
  'Chandigarh University Main Gate, Gharuan',
  'Thapar Institute Main Gate, Patiala',
  'Lovely Professional University (LPU) Gate 1, Phagwara',
  'State University Main Campus Gate 1',
  'State University Main Campus Gate 2',
  'State University Engineering Block',
  'Delhi University (DU) North Campus, Delhi',
  'Delhi Technological University (DTU) Main Gate, Delhi',
  'IIT Delhi Main Gate, Hauz Khas, Delhi',
  'Cyber City, Gurugram',
  'Amity University Gate 2, Noida',
  'BITS Pilani Main Campus Gate, Rajasthan',
  'VIT University Main Gate, Vellore',
  'SRM University Main Gate, Kattankulathur',
];

export default function LocationAutocompleteInput({
  value,
  onChange,
  placeholder = "e.g. Sector 17, Chandigarh",
  label,
  iconColor = "text-emerald-400",
  required = false,
  showMyLocationOption = true,
}) {
  const [suggestions, setSuggestions] = useState(POPULAR_LOCATIONS.slice(0, 6));
  const [showDropdown, setShowDropdown] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (!val || val.trim().length < 1) {
      setSuggestions(POPULAR_LOCATIONS.slice(0, 6));
      setShowDropdown(true);
      return;
    }

    const query = val.toLowerCase().trim();
    
    // Filter local dataset instantly
    const localMatches = POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(query)
    );

    setSuggestions(localMatches);
    setShowDropdown(true);

    // Also fetch online OSM API asynchronously if query length >= 2
    if (val.trim().length >= 2) {
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=4`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.features) {
            const apiMatches = data.features.map((f) => {
              const p = f.properties || {};
              return [p.name, p.district || p.city, p.state].filter(Boolean).join(', ');
            }).filter(Boolean);

            const merged = Array.from(new Set([...localMatches, ...apiMatches])).slice(0, 6);
            setSuggestions(merged);
          }
        })
        .catch(() => {});
    }
  };

  const handleSelectSuggestion = (locName) => {
    onChange(locName);
    setShowDropdown(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setShowDropdown(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const shortLoc = parts.slice(0, 3).join(', ');
            onChange(shortLoc);
          } else {
            onChange(`GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
          }
        } catch (err) {
          onChange(`GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setDetectingGps(false);
        alert('Could not detect GPS position. Please allow location permissions in your browser.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasValue = Boolean(value && value.trim().length >= 2);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`;

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-slate-300 text-xs mb-1">{label}</label>
          {showMyLocationOption && (
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={detectingGps}
              title="Detect current location via browser GPS"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-1 bg-emerald-950/50 hover:bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition-all mb-1 shadow-sm"
            >
              {detectingGps ? (
                <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3 text-emerald-400" />
              )}
              <span>{detectingGps ? 'Locating...' : 'Use My Location'}</span>
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <MapPin className={`w-4 h-4 ${iconColor} absolute left-3 top-3`} />
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setShowDropdown(true);
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-9 pr-20 py-2.5 bg-slate-950 border ${
            hasValue ? 'border-emerald-500/60 ring-1 ring-emerald-500/20' : 'border-slate-800'
          } rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-all`}
        />

        {/* Google Maps External Link Shortcut inside Input */}
        {hasValue && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open location on Google Maps to verify"
            className="absolute right-2 top-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-sky-400 hover:text-sky-300 hover:border-sky-500/50 flex items-center gap-1 transition-all shadow"
          >
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Maps ↗</span>
          </a>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {/* Use My Current Location Option */}
          {showMyLocationOption && (
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={detectingGps}
              className="w-full text-left px-3 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-emerald-300 font-bold transition-colors"
            >
              <div className="flex items-center gap-2">
                {detectingGps ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                )}
                <span>{detectingGps ? 'Detecting your GPS location...' : '📍 Use My Current Location'}</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">GPS</span>
            </button>
          )}

          <div className="px-3 py-1 bg-slate-950/80 border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Verified Campus & City Hubs</span>
            <span className="text-emerald-400">Google Maps Aware</span>
          </div>

          {suggestions.map((locName, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(locName)}
              className="w-full text-left px-3 py-2.5 text-xs hover:bg-slate-800 border-b border-slate-800/40 last:border-0 flex items-center gap-2 text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-100 truncate">{locName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Helpful Location Helper Line */}
      {hasValue && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 px-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
            Location Set
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
          >
            Check on Google Maps <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        </div>
      )}
    </div>
  );
}
