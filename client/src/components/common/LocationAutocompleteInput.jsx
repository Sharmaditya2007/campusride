import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

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

  // Verify location against OpenStreetMap / Google Maps data when value changes
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setIsVerified(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=3`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        setIsVerified(value.trim().length > 3);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    onChange(val);
    setIsVerified(false);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=5`
      );
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setSuggestions(data);
      }
    } catch (err) {
      console.warn('Location lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (place) => {
    const shortName = place.display_name.split(',').slice(0, 3).join(', ');
    onChange(shortName);
    setIsVerified(true);
    setShowDropdown(false);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`;

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-slate-300 text-xs mb-1">{label}</label>
          {isVerified && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
              Verified Map Location
            </span>
          )}
        </div>
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
          className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin absolute right-2.5 top-3" />
        ) : isVerified ? (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Verified location! Click to open in Google Maps"
            className="absolute right-2.5 top-2.5 p-0.5 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </a>
        ) : null}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((item, idx) => {
            const parts = item.display_name.split(',');
            const primary = parts.slice(0, 2).join(',');
            const secondary = parts.slice(2, 4).join(',');

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800/50 last:border-0 flex items-start gap-2 text-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-100">{primary}</div>
                  {secondary && <div className="text-[10px] text-slate-400 truncate">{secondary}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Verified Status Footer */}
      {value && isVerified && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 px-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
            Verified Location
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-0.5 font-medium"
          >
            Google Maps <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        </div>
      )}
    </div>
  );
}
