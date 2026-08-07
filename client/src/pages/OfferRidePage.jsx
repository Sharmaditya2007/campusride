import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { PlusCircle, MapPin, Calendar, Clock, Car, Users, DollarSign, FileText, ShieldAlert, CheckCircle } from 'lucide-react';

const OfferRidePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
    availableSeats: 3,
    contribution: 50,
    vehicleId: '',
    notes: 'Non-smoking carpool, please be on time at pickup hub.',
    isRecurring: false,
    recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  const [vehicles, setVehicles] = useState([]);
  const [driverStatus, setDriverStatus] = useState('verified');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehiclesAndVerification = async () => {
      try {
        const vRes = await api.get('/vehicles');
        if (vRes.success && vRes.data.length > 0) {
          setVehicles(vRes.data);
          setFormData((prev) => ({ ...prev, vehicleId: vRes.data[0]._id }));
        }

        const verRes = await api.get('/verification/status');
        if (verRes.success) {
          setDriverStatus(verRes.data.driverVerificationStatus || 'verified');
        }
      } catch (err) {}
    };

    fetchVehiclesAndVerification();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in to offer a ride.', 'error');
      navigate('/login');
      return;
    }

    if (user.verificationStatus !== 'verified') {
      showToast('Student ID verification required before offering rides.', 'error');
      navigate('/verify-student');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/rides', formData);
      if (res.success) {
        showToast('Ride posted successfully! You earned +20 CampusPoints 🎉', 'success');
        navigate('/my-rides');
      }
    } catch (err) {
      showToast(err.message || 'Failed to offer ride.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Offer a Campus Ride</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Share empty vehicle seats with verified peers traveling on your route.
          </p>
        </div>

        {/* Verification Alert Banner if pending */}
        {driverStatus !== 'verified' && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Driver Licence Verification Required</p>
              <p className="text-slate-300 mt-0.5">
                To offer rides safely, please complete your driver licence verification under account settings.
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Route Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Starting Pickup Hub</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Sector 17 Plaza, Chandigarh"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Dropoff Destination</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. State University Campus Gate 1"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ride Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Departure Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Available Seats</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contribution / Seat (₹)</label>
                <div className="relative">
                  <span className="text-emerald-400 font-bold text-sm absolute left-3.5 top-2.5 select-none">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Vehicle</label>
                <div className="relative">
                  <Car className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {vehicles.length > 0 ? (
                      vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.model} ({v.registrationNumber})
                        </option>
                      ))
                    ) : (
                      <option value="">Honda City (CH-01-AB-4890)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Recurring Ride Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="font-bold text-slate-200">Recurring College Commute</span>
              </label>
              {formData.isRecurring && (
                <p className="text-[11px] text-slate-400">
                  Automatically offers this ride every weekday (Mon-Fri) at your set departure time.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ride Notes for Passengers</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              {loading ? 'Publishing Ride Offer...' : 'PUBLISH CAMPUS RIDE OFFER'}
            </button>

          </form>
        </div>

      </div>
    </MainLayout>
  );
};

export default OfferRidePage;
