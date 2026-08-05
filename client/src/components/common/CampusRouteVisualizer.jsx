import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Clock, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const hubs = [
  { id: 'h1', name: 'Sector 17 Bus Stand', type: 'Major Hub', x: '15%', y: '30%', activeRides: 0 },
  { id: 'h2', name: 'Mohali Phase 7 Hub', type: 'Suburban Hub', x: '45%', y: '60%', activeRides: 0 },
  { id: 'h3', name: 'Zirakpur VIP Crossing', type: 'Highway Hub', x: '75%', y: '35%', activeRides: 0 },
  { id: 'h4', name: 'Campus Main Gate 1', type: 'Campus Hub', x: '50%', y: '20%', activeRides: 0 },
];

const CampusRouteVisualizer = () => {
  const [selectedHub, setSelectedHub] = useState(hubs[0]);
  const [activeRides, setActiveRides] = useState([]);

  useEffect(() => {
    const fetchLiveRides = async () => {
      try {
        const res = await api.get('/rides/going-now');
        if (res.success && Array.isArray(res.data)) {
          setActiveRides(res.data);
        }
      } catch (err) {}
    };
    fetchLiveRides();
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 relative overflow-hidden shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 w-max">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Campus Hub Simulator
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-2">
            Live Route & Pickup Hub Visualizer
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on pickup hubs below to view active drivers and real-time departure schedules.
          </p>
        </div>

        <Link
          to="/find-ride"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 transition"
        >
          Explore All Routes <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Interactive Map Visualizer Container */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden p-4">
        
        {/* Grid Background Lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        {/* Animated Connecting Route Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="15%" y1="30%" x2="50%" y2="20%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="45%" y1="60%" x2="50%" y2="20%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="75%" y1="35%" x2="50%" y2="20%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        {/* Render Interactive Hub Pins */}
        {hubs.map((hub) => {
          const isSelected = selectedHub.id === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => setSelectedHub(hub)}
              style={{ left: hub.x, top: hub.y }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${
                isSelected ? 'scale-110 z-20' : 'scale-100 z-10 hover:scale-105'
              }`}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/30'
                      : 'bg-slate-900/90 text-emerald-400 border border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div
                  className={`mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}
                >
                  {hub.name}
                </div>
              </div>
            </button>
          );
        })}

        {/* Selected Hub Quick Specs overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-800 backdrop-blur-md p-3.5 rounded-xl text-xs space-y-1 max-w-xs z-30">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Navigation className="w-4 h-4" />
            <span>{selectedHub.name}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {selectedHub.type} • {activeRides.length} Active Student Carpools
          </p>
        </div>

      </div>

      {/* Driver Cards Row */}
      {activeRides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeRides.slice(0, 3).map((r, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold text-white">
                <span>{r.driverId?.fullName || 'Student Driver'}</span>
                <span className="text-emerald-400 font-black">₹{r.contribution}</span>
              </div>
              <p className="text-slate-400">{r.source} ➔ {r.destination}</p>
              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400 border-t border-slate-900">
                <span>{r.departureTime}</span>
                <span className="text-teal-400 font-semibold">{r.availableSeats} Seats Left</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">No active scheduled rides on this hub right now.</p>
          <Link to="/offer-ride" className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
            + Offer the First Ride
          </Link>
        </div>
      )}

    </div>
  );
};

export default CampusRouteVisualizer;
