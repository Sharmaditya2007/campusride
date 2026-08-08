import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  Heart,
  Leaf,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617] border-t border-slate-800/80 pt-16 pb-10 text-slate-400 text-sm relative overflow-hidden">
      
      {/* Subtle Ambient Radial Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        
        {/* Top Callout Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/40 border border-slate-800/90 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" /> 0% Platform Commission — FREE Launch Offer
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to Share Your Daily Campus Commute?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Connect with verified college peers traveling on your exact daily route.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/find-ride"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-90 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
            >
              Find a Ride <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/offer-ride"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              Offer Car Seats
            </Link>
          </div>
        </div>

        {/* 4-Column Balanced Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-900/90">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  Campus<span className="text-emerald-400">Ride</span>
                </span>
                <span className="text-[10px] font-medium text-emerald-500/80 tracking-widest uppercase">Verified Student Carpool</span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed">
              Verified university carpool platform connecting college students on daily commute routes. Split travel costs, travel safely with verified peers, and reduce campus emissions.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Verified University Network</span>
              </div>
            </div>
          </div>

          {/* Col 2: Carpool Features */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-emerald-400" /> Carpool Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/find-ride" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  Find a Campus Ride
                </Link>
              </li>
              <li>
                <Link to="/offer-ride" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  Offer Empty Car Seats
                </Link>
              </li>
              <li>
                <Link to="/commute-groups" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  Daily Commute Cohorts
                </Link>
              </li>
              <li>
                <Link to="/environmental-impact" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  Eco Impact Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Account */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-teal-400" /> Student Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/my-rides" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                  My Rides & Bookings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                  Student ID & Profile
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                  My Car Vehicles
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                  Campus Wallet & Activity
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Hubs */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> University Hubs
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200 block">Chitkara University Hub</span>
                <span className="text-[11px] text-emerald-400 block font-medium">Gate 1 & Gate 2 Shuttle Hubs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200 block">PU & Chandigarh Nodes</span>
                <span className="text-[11px] text-teal-400 block font-medium">Sector 17, 43 Bus Stand & Dorms</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusRide Inc. All rights reserved. Built for verified college campuses.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Operational
            </span>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>for student carpooling</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
