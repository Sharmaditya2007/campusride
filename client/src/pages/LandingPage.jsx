import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CampusRouteVisualizer from '../components/common/CampusRouteVisualizer';
import api from '../services/api';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import {
  Car,
  ShieldCheck,
  Zap,
  Leaf,
  DollarSign,
  Users,
  Search,
  PlusCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  Shield,
  Star,
  Compass,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [impactStats, setImpactStats] = useState({
    totalSharedRides: 0,
    totalKilometersShared: 0,
    estimatedFuelSavedLiters: 0,
    estimatedMoneySavedINR: 0,
    estimatedCO2ReducedKg: 0,
  });

  const [openFaq, setOpenFaq] = useState(null);

  // Quick Hero Search Form State
  const [searchQuery, setSearchQuery] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [featuredRides, setFeaturedRides] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/features/environmental-impact');
        if (res.success) {
          setImpactStats(res.data);
        }
      } catch (err) {}
    };
    const fetchRides = async () => {
      try {
        const res = await api.get('/rides/going-now');
        if (res.success && Array.isArray(res.data)) {
          setFeaturedRides(res.data);
        }
      } catch (err) {}
    };
    fetchStats();
    fetchRides();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/find-ride?source=${encodeURIComponent(searchQuery.source)}&destination=${encodeURIComponent(searchQuery.destination)}&date=${searchQuery.date}`);
  };

  const faqs = [
    {
      q: 'What is CampusRide?',
      a: 'CampusRide is a verified university-only carpool and ride-sharing platform designed specifically for college students and faculty to share daily commutes safely.',
    },
    {
      q: 'Who can access ride offers?',
      a: 'Only students and campus faculty verified through official university email (@college.ac.in / .edu) or student ID cards can access ride offers.',
    },
    {
      q: 'Can I both find and offer rides with one account?',
      a: 'Yes! A single Student Account lets you book a passenger seat on Monday and offer rides as a driver on Tuesday after adding your vehicle details.',
    },
    {
      q: 'How does cost sharing & monetization work?',
      a: 'Drivers set a small, fair cost contribution per passenger seat to split fuel expenses. CampusRide currently charges 0% platform fee (100% of your contribution goes directly to fuel sharing).',
    },
    {
      q: 'How are drivers verified for safety?',
      a: 'Every student must verify their official university email (@college.ac.in / .edu) or Student ID before booking or offering rides.',
    },
    {
      q: 'What happens if a driver cancels my confirmed ride?',
      a: 'Our smart Backup Ride System automatically scans compatible alternative student carpools along your route and provides instant one-click re-booking.',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-mesh-dark bg-grid-pattern -mt-6 pt-6 min-h-screen">
        
        {/* 1. HERO SECTION WITH RICH AESTHETICS & EMBEDDED SEARCH WIDGET */}
        <section className="relative pt-8 pb-20 overflow-hidden">
          {/* Animated Ambient Glow Orbs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-8">
            
            {/* Top Live Pill */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide shadow-lg shadow-emerald-500/10 backdrop-blur-md animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>🟢 Live Campus Carpool Network Active Today</span>
              </div>
            </div>

            {/* Main Hero Headline */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                Smart College Carpools.{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Split Fares, Commute Safer.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Connect with verified student peers traveling between your neighborhood, PG, hostel, and campus. Share empty car seats, reduce daily travel costs by 60%, and earn rewards.
              </p>
            </div>

            {/* Interactive Hero Search Form Box */}
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={handleHeroSearch}
                className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
              >
                {/* Pickup Location */}
                <div className="flex-1">
                  <LocationAutocompleteInput
                    label="Pickup Hub / Area"
                    value={searchQuery.source}
                    onChange={(val) => setSearchQuery({ ...searchQuery, source: val })}
                    placeholder="e.g. Sector 17 / Mohali"
                    iconColor="text-emerald-400"
                  />
                </div>

                {/* Destination Location */}
                <div className="flex-1">
                  <LocationAutocompleteInput
                    label="Destination Campus"
                    value={searchQuery.destination}
                    onChange={(val) => setSearchQuery({ ...searchQuery, destination: val })}
                    placeholder="e.g. Main Gate 1 / Campus"
                    iconColor="text-indigo-400"
                  />
                </div>

                {/* Date */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 focus-within:border-emerald-500 transition sm:w-44">
                  <Clock className="w-5 h-5 text-teal-400 shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
                    <input
                      type="date"
                      value={searchQuery.date}
                      onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
                      className="bg-transparent text-xs text-white focus:outline-none w-full font-semibold"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-5 h-5" />
                  Find Carpool
                </button>
              </form>
            </div>

            {/* Quick Metrics Cards */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80">
                <span className="text-slate-400 text-xs font-semibold block">Verified Students</span>
                <span className="text-2xl font-black text-white mt-1 block">100% ID Verified</span>
                <span className="text-[11px] text-emerald-400 font-medium">Uni email verified</span>
              </div>
              <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80">
                <span className="text-slate-400 text-xs font-semibold block">Route Match Accuracy</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">95%+ Precision</span>
                <span className="text-[11px] text-slate-400 font-medium">Smart timetable match</span>
              </div>
              <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80">
                <span className="text-slate-400 text-xs font-semibold block">Avg Commute Savings</span>
                <span className="text-2xl font-black text-teal-400 mt-1 block">60% Cost Saved</span>
                <span className="text-[11px] text-slate-400 font-medium">Split fuel & toll</span>
              </div>
              <div className="glass-card glass-card-hover p-5 rounded-2xl border-slate-800/80">
                <span className="text-slate-400 text-xs font-semibold block">Safety Rating</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">4.9 ★ Rating</span>
                <span className="text-[11px] text-amber-300/80 font-medium">Top-rated campus drivers</span>
              </div>
            </div>

          </div>
        </section>

        {/* INTERACTIVE ROUTE & HUB VISUALIZER */}
        <section className="py-12 max-w-6xl mx-auto px-4">
          <CampusRouteVisualizer />
        </section>

        {/* 3. FEATURED ACTIVE RIDES SHOWCASE */}
        <section className="py-16 border-t border-slate-900/80">
          <div className="max-w-6xl mx-auto px-4 space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Popular Campus Carpool Routes</h2>
                <p className="text-slate-400 text-sm mt-1">Live ride offers scheduled for upcoming university hours.</p>
              </div>
              <Link
                to="/find-ride"
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                View All Rides <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>

            {featuredRides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredRides.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="glass-card glass-card-hover p-6 rounded-3xl border-slate-800 space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{r.source} ➔ {r.destination}</h4>
                        <span className="text-xs text-emerald-400 font-semibold">{r.departureTime} Departure</span>
                      </div>
                      <span className="text-lg font-black text-white">₹{r.contribution}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-bold text-slate-200">{r.driverId?.fullName || 'Verified Driver'}</span>
                        <span className="text-amber-400 font-bold">{r.driverId?.rating || 5.0} ★</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{r.driverId?.university || 'Campus Driver'}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-teal-400">{r.availableSeats} Seats Left</span>
                      <Link
                        to={`/ride/${r._id}`}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
                      >
                        Book Seat
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-8 sm:p-10 rounded-3xl border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">No Active Rides Right Now</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Be the first verified campus driver to post a carpool route or commute schedule for your university!
                </p>
                <div className="pt-2">
                  <Link
                    to="/offer-ride"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    + Offer a Campus Ride
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. SAFETY & VERIFICATION SECTION */}
        <section className="py-16 border-t border-slate-900/80">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Multi-Layer Student Safety</h2>
              <p className="text-slate-400 text-sm">Designed specifically for university trust and peace of mind.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card glass-card-hover p-7 rounded-3xl border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">University Email Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every user must confirm an official college email address (@college.ac.in / .edu) or submit student ID cards before booking or listing rides.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-7 rounded-3xl border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Driver & Vehicle Auditing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Students offering rides submit valid Driving License credentials and vehicle registration (RC) verified by administrators.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-7 rounded-3xl border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Live OTP & Boarding Pass</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  4-digit boarding OTP generated for every passenger booking to guarantee safe, verified boarding at pickup hubs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FAQ ACCORDION SECTION */}
        <section className="py-16 border-t border-slate-900/80">
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
              <p className="text-slate-400 text-sm">Everything you need to know about CampusRide carpooling.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card rounded-2xl border-slate-800 overflow-hidden transition">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 text-left font-bold text-slate-200 text-sm flex items-center justify-between hover:bg-slate-900/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default LandingPage;
