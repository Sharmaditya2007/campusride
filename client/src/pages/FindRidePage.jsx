import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import RideCard from '../components/rides/RideCard';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import { Search, Filter, SlidersHorizontal, MapPin, Clock, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

const FindRidePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [seats, setSeats] = useState(1);
  const [maxPrice, setMaxPrice] = useState('');

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingRide, setRequestingRide] = useState(null);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        source,
        destination,
        date,
        time,
        seats,
        maxPrice: maxPrice || '',
      });
      const res = await api.get(`/rides/search?${params.toString()}`);
      if (res.success) {
        setRides(res.data);
      }
    } catch (err) {
      console.warn('[FindRide] Search warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleRequestRide = async (ride) => {
    if (!user) {
      showToast('Please log in to request ride seats.', 'error');
      return;
    }

    try {
      const res = await api.post(`/requests/ride/${ride._id}`, {
        requestedSeats: Number(seats),
        pickupPoint: ride.source,
      });

      if (res.success) {
        showToast('Ride request sent to driver! Track status under My Rides.', 'success');
        fetchRides();
      }
    } catch (err) {
      showToast(err.message || 'Ride request failed.', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Find a Campus Ride</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Search route-aware student carpools with smart percentage match scores.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            
            <LocationAutocompleteInput
              label="Starting From"
              value={source}
              onChange={setSource}
              placeholder="e.g. Mohali Phase 7"
              iconColor="text-emerald-400"
            />

            <LocationAutocompleteInput
              label="Destination Campus"
              value={destination}
              onChange={setDestination}
              placeholder="e.g. Campus Gate 2"
              iconColor="text-rose-400"
            />

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <div className="relative cursor-pointer" onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input && input.showPicker) try { input.showPicker(); } catch(err){}
              }}>
                <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Time</label>
              <div className="relative cursor-pointer" onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input && input.showPicker) try { input.showPicker(); } catch(err){}
              }}>
                <Clock className="w-4 h-4 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Search Rides
              </button>
            </div>

          </form>

          {/* Filter Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                Max Contribution (₹):
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 300"
                className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <span className="text-slate-400 font-medium">
              Showing {rides.length} matching ride offers
            </span>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Searching route database & computing match scores...</p>
          </div>
        ) : rides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <RideCard key={ride._id} ride={ride} onRequest={handleRequestRide} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-3xl text-center space-y-4 border-slate-800">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Matching Rides Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try broadening your departure time or search parameters, or offer a ride yourself!
            </p>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default FindRidePage;
