import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import QuickBoardingModal from '../components/rides/QuickBoardingModal';
import PaymentModal from '../components/PaymentModal';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Car, Clock, MapPin, Check, X, QrCode, AlertCircle, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react';

const MyRidesPage = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('booked'); // 'offered' | 'booked'
  const [loading, setLoading] = useState(true);

  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);

  const [backupSuggestions, setBackupSuggestions] = useState([]);
  const [boardingModalOpen, setBoardingModalOpen] = useState(false);
  const [selectedReqForBoarding, setSelectedReqForBoarding] = useState(null);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedReqForPayment, setSelectedReqForPayment] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookedRes, offeredRes] = await Promise.all([
        api.get('/my-rides/booked').catch(() => ({ success: false, data: [] })),
        api.get('/my-rides/offered').catch(() => ({ success: false, data: [] })),
      ]);

      if (bookedRes.success && bookedRes.data) {
        setBookedRides(bookedRes.data);
      }
      if (offeredRes.success && offeredRes.data) {
        setOfferedRides(offeredRes.data);
      }
    } catch (err) {
      showToast('Failed to load rides', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRequest = async (reqId) => {
    try {
      await api.put(`/requests/${reqId}/accept`);
      showToast('Ride request accepted! Seat allocated safely.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Accept request failed', 'error');
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await api.put(`/requests/${reqId}/reject`);
      showToast('Ride request rejected.', 'info');
      loadData();
    } catch (err) {}
  };

  const fetchBackups = async (rideId) => {
    try {
      const res = await api.get(`/my-rides/backup-suggestions/${rideId}`);
      if (res.success) {
        setBackupSuggestions(res.data);
        showToast('Backup ride matches loaded below!', 'info');
      }
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Campus Rides</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Manage your offered rides, bookings, and payments.</p>
          </div>

          <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('booked')}
              className={`px-5 py-2 rounded-xl transition-all ${
                activeTab === 'booked' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rides I Booked ({bookedRides.length})
            </button>
            <button
              onClick={() => setActiveTab('offered')}
              className={`px-5 py-2 rounded-xl transition-all ${
                activeTab === 'offered' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rides I Offered ({offeredRides.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Booked Rides */}
        {activeTab === 'booked' && (
          <div className="space-y-4">
            {bookedRides.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 rounded-3xl space-y-3">
                <Car className="w-10 h-10 mx-auto text-slate-600" />
                <p>You haven't booked any campus rides yet.</p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                >
                  Find a Ride Now
                </Link>
              </div>
            ) : (
              bookedRides.map((b) => (
                <div key={b._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">
                          {b.rideId?.source} ➔ {b.rideId?.destination}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {b.rideId?.date} at {b.rideId?.departureTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          b.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        STATUS: {b.status.toUpperCase()}
                      </span>

                      {/* Payment Badge or Pay Now Trigger */}
                      {b.status === 'accepted' && (
                        b.paymentStatus === 'paid' ? (
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> PAID
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReqForPayment(b);
                              setPaymentModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-xs shadow-md hover:opacity-90 flex items-center gap-1.5 transition"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay Now
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Driver</span>
                      <p className="font-semibold text-slate-200">{b.rideId?.driverId?.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Vehicle</span>
                      <p className="font-mono text-emerald-400 font-bold">
                        {b.rideId?.vehicleId?.registrationNumber || 'Verified Car'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Boarding OTP Pass</span>
                      <p className="font-mono font-black text-lg text-white tracking-widest">{b.boardingOtp}</p>
                    </div>
                  </div>

                  {b.status === 'cancelled' && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" /> Driver Cancelled This Ride
                      </div>
                      <button
                        onClick={() => fetchBackups(b.rideId?._id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Find Backup Matches
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Offered Rides */}
        {activeTab === 'offered' && (
          <div className="space-y-4">
            {offeredRides.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 rounded-3xl space-y-3">
                <Car className="w-10 h-10 mx-auto text-slate-600" />
                <p>You haven't offered any campus rides yet.</p>
                <Link
                  to="/offer-ride"
                  className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                >
                  Offer a Ride
                </Link>
              </div>
            ) : (
              offeredRides.map((ride) => (
                <div key={ride._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {ride.source} ➔ {ride.destination}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {ride.date} at {ride.departureTime} • {ride.availableSeats} seats available • ₹{ride.contribution}/seat
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      ACTIVE OFFER
                    </span>
                  </div>

                  {/* Incoming Requests */}
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold text-slate-300">Passenger Requests:</h5>
                    {!ride.incomingRequests || ride.incomingRequests.length === 0 ? (
                      <p className="text-xs text-slate-500">No passenger requests received yet.</p>
                    ) : (
                      ride.incomingRequests.map((req) => (
                        <div
                          key={req._id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{req.passengerId?.fullName}</span>
                            <span className="text-slate-400 block">Requested {req.requestedSeats} seat(s)</span>
                          </div>

                          {req.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptRequest(req._id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req._id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                                ACCEPTED
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedReqForBoarding(req);
                                  setBoardingModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center gap-1"
                              >
                                <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Verify Boarding OTP
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Boarding Verification Modal */}
        <QuickBoardingModal
          isOpen={boardingModalOpen}
          onClose={() => setBoardingModalOpen(false)}
          request={selectedReqForBoarding}
          isDriver={true}
        />

        {/* Payment Checkout Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          rideRequest={selectedReqForPayment}
          onPaymentSuccess={() => {
            showToast('Payment successful!', 'success');
            loadData();
          }}
        />
      </div>
    </MainLayout>
  );
};

export default MyRidesPage;
