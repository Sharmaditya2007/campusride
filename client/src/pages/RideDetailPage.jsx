import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import QuickBoardingModal from '../components/rides/QuickBoardingModal';
import MatchScoreBadge from '../components/rides/MatchScoreBadge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import UserAvatar from '../components/common/UserAvatar';
import { MapPin, Clock, ShieldCheck, Star, Users, Car, AlertTriangle, Send, QrCode, ArrowLeft, Share2 } from 'lucide-react';

const RideDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardingOpen, setBoardingOpen] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState(1);

  // Chat message state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const fetchRide = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/rides/${id}`);
        if (res.success) {
          setRide(res.data);
        }
      } catch (err) {
        console.warn('[RideDetail] Fetch warning');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleRequestRide = async () => {
    if (!user) {
      showToast('Please log in to request seats.', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/requests/ride/${id}`, {
        requestedSeats: Number(requestedSeats),
        pickupPoint: ride?.source,
      });

      if (res.success) {
        showToast('Ride request sent to driver!', 'success');
        navigate('/my-rides');
      }
    } catch (err) {
      showToast(err.message || 'Ride request failed.', 'error');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { senderName: user?.fullName || 'Student', content: chatInput, createdAt: 'Just now' },
    ]);
    setChatInput('');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Temporary trip link copied! Share with family or friends.', 'success');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading ride route details...</p>
        </div>
      </MainLayout>
    );
  }

  const driver = ride?.driverId || {};
  const vehicle = ride?.vehicleId || {};

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back button & Action pills */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rides
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" /> Share My Ride
            </button>

          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Route & Driver */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Route Card */}
            <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  {ride?.date} • Departing {ride?.departureTime}
                </span>
                <MatchScoreBadge score={ride?.matchScore || 94} />
              </div>

              {/* Timeline graphic */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 mt-1 shrink-0" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Pickup Location</span>
                    <h3 className="text-base font-extrabold text-white">{ride?.source}</h3>
                  </div>
                </div>

                <div className="ml-2 pl-4 border-l-2 border-dashed border-slate-800 py-2">
                  <span className="text-xs text-slate-400 font-medium">Estimated Travel Time: {ride?.estimatedArrival || '30 mins'}</span>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Dropoff Campus</span>
                    <h3 className="text-base font-extrabold text-white">{ride?.destination}</h3>
                  </div>
                </div>
              </div>

              {/* Vehicle & Specs */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Vehicle</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{vehicle?.model || 'Car'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Plate No</span>
                  <span className="font-mono font-bold text-emerald-400 mt-0.5 block">{vehicle?.registrationNumber || 'Assigned Vehicle'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Available Seats</span>
                  <span className="font-bold text-teal-400 mt-0.5 block">{ride?.availableSeats} of {ride?.totalSeats}</span>
                </div>
              </div>

              {/* Ride Notes */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-slate-200 block">Driver Notes:</span>
                <p>{ride?.notes}</p>
              </div>

            </div>

            {/* Live Chat Box */}
            <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h4 className="text-sm font-extrabold text-white">Ride Group Chat</h4>
              <div className="h-44 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                {messages.map((m, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-emerald-400">{m.senderName}</span>
                      <span>{m.createdAt}</span>
                    </div>
                    <p className="text-slate-200">{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask driver about pickup points..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>

          </div>

          {/* Right Col: Driver Profile & Booking Box */}
          <div className="space-y-6">
            
            {/* Driver Profile */}
            <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <div className="text-center space-y-2">
                <UserAvatar
                  user={driver}
                  className="w-20 h-20 rounded-2xl ring-4 ring-emerald-500/30 mx-auto text-xl"
                />
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center justify-center gap-1.5">
                    {driver.fullName || 'Verified Driver'}
                    {driver.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{driver.university || 'State University'}</p>
                </div>

                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{driver.rating || 4.9} ({driver.ratingCount || 24} ratings)</span>
                </div>
              </div>
            </div>

            {/* Booking Action Box */}
            <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Total Contribution</span>
                <span className="text-2xl font-black text-white">₹{ride?.contribution}<span className="text-xs font-normal text-slate-400"> / seat</span></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seats to Request</label>
                <select
                  value={requestedSeats}
                  onChange={(e) => setRequestedSeats(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                </select>
              </div>

              <button
                onClick={handleRequestRide}
                disabled={ride?.availableSeats === 0}
                className={`w-full py-4 rounded-xl font-extrabold text-xs shadow-lg transition-all ${
                  ride?.availableSeats > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {ride?.availableSeats > 0 ? `REQUEST ${requestedSeats} SEAT(S) NOW` : 'RIDE FULL'}
              </button>

              <button
                onClick={() => setBoardingOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-850 flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-emerald-400" /> View Boarding Pass
              </button>

            </div>

          </div>

        </div>

        {/* Modals */}
        <QuickBoardingModal isOpen={boardingOpen} onClose={() => setBoardingOpen(false)} request={{ boardingOtp: '4829' }} />

      </div>
    </MainLayout>
  );
};

export default RideDetailPage;
