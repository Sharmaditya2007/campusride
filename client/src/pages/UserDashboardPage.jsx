import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UserAvatar from '../components/common/UserAvatar';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  Award,
  Calendar,
  Users,
  Leaf,
  ArrowRight,
  Wallet,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    walletBalance: user?.walletBalance || 250,
    campusPoints: user?.campusPoints || 100,
    ridesTaken: user?.ridesTakenCount || 0,
    ridesOffered: user?.ridesOfferedCount || 0,
    isVipPass: user?.isVipPass || false,
  });

  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [meRes, walletRes, bookedRes] = await Promise.all([
          api.get('/auth/me').catch(() => ({ success: false })),
          api.get('/payments/wallet').catch(() => ({ success: false })),
          api.get('/my-rides/booked').catch(() => ({ success: false, data: [] })),
        ]);

        if (meRes.success && meRes.data?.user) {
          const u = meRes.data.user;
          setStats((prev) => ({
            ...prev,
            campusPoints: u.campusPoints || 100,
            ridesTaken: u.ridesTakenCount || 0,
            ridesOffered: u.ridesOfferedCount || 0,
          }));
        }

        if (walletRes.success && walletRes.data) {
          setStats((prev) => ({
            ...prev,
            walletBalance: walletRes.data.walletBalance,
            isVipPass: walletRes.data.isVipPass,
          }));
        }

        if (bookedRes.success && bookedRes.data) {
          setRecentRides(bookedRes.data.slice(0, 3));
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* 1. WELCOME HERO BANNER */}
        <div className="glass-panel p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar
                  user={user}
                  className="w-16 h-16 rounded-2xl ring-2 ring-emerald-500/40 shadow-lg text-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                  <ShieldCheck className="w-3.5 h-3.5 fill-slate-950" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
                  </h1>
                  {stats.isVipPass && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                      ⭐ VIP Member
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {user?.university || 'University Campus'} • {user?.department || 'General'} Student
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                to="/find-ride"
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
              >
                <Search className="w-4 h-4" /> Find a Ride
              </Link>

              <Link
                to="/offer-ride"
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-850 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" /> Offer Ride
              </Link>
            </div>
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/wallet"
            className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80 space-y-2 block"
          >
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Campus Wallet</span>
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-white">₹{stats.walletBalance}</div>
            <span className="text-[11px] text-indigo-300 font-medium">Manage & Add Funds ➔</span>
          </Link>

          <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CampusPoints</span>
              <Award className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats.campusPoints} pts</div>
            <span className="text-[11px] text-slate-400 font-medium">Eco Level 2 Commuter</span>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-teal-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rides Taken</span>
              <Car className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-white">{stats.ridesTaken} Rides</div>
            <span className="text-[11px] text-slate-400 font-medium">60% Fuel Saved</span>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Safety Rating</span>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-amber-400">4.9 ★</div>
            <span className="text-[11px] text-slate-400 font-medium">Verified Student Profile</span>
          </div>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Quick Actions & Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/my-rides" className="glass-card glass-card-hover p-6 rounded-3xl border-slate-800 space-y-3 block">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">My Rides & Bookings</h3>
              <p className="text-xs text-slate-400">Track active bookings, passenger seat requests, and boarding passes.</p>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">Open Rides <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link to="/wallet" className="glass-card glass-card-hover p-6 rounded-3xl border-slate-800 space-y-3 block">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Wallet & VIP Subscription</h3>
              <p className="text-xs text-slate-400">View transaction ledger, add funds, or activate 0% fee VIP pass.</p>
              <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">Open Wallet <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>

        {/* 4. RECENT RIDE BOOKINGS PREVIEW */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Recent Booked Carpools
            </h3>
            <Link to="/my-rides" className="text-xs font-bold text-emerald-400 hover:underline">
              View All
            </Link>
          </div>

          {recentRides.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No recent carpool bookings found. Find a ride or offer one to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {recentRides.map((b) => (
                <div key={b._id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{b.rideId?.source} ➔ {b.rideId?.destination}</h4>
                    <span className="text-slate-400">{b.rideId?.date} at {b.rideId?.departureTime}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default UserDashboardPage;
