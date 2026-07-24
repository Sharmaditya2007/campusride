import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Heart, Leaf, Mail, Phone, Lock, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900/80 pt-16 pb-8 text-slate-400 text-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
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
              Verified university carpool platform connecting students traveling on similar daily routes. Split fuel costs, commute safely with verified peers, and reduce carbon emissions.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified College Network</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-bold text-xs uppercase tracking-wider">Carpool Features</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/find-ride" className="hover:text-emerald-400 transition-colors">Find a Campus Ride</Link></li>
              <li><Link to="/offer-ride" className="hover:text-emerald-400 transition-colors">Offer Empty Car Seats</Link></li>
              <li><Link to="/wallet" className="hover:text-emerald-400 transition-colors">Campus Wallet & VIP Pass</Link></li>
              <li><Link to="/timetable" className="hover:text-emerald-400 transition-colors">Timetable Commute Sync</Link></li>
              <li><Link to="/commute-groups" className="hover:text-emerald-400 transition-colors">Daily Commute Cohorts</Link></li>
              <li><Link to="/environmental-impact" className="hover:text-emerald-400 transition-colors">Campus CO₂ Impact</Link></li>
            </ul>
          </div>

          {/* Col 3: Safety & Trust */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-bold text-xs uppercase tracking-wider">Safety & Audits</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Student ID Verification</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Driver License Auditing</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Emergency SOS & Tracking</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Community Guidelines</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition-colors">Trust & Rating Protocol</Link></li>
            </ul>
          </div>

          {/* Col 4: University Hotline & Pass */}
          <div className="space-y-4">
            <h4 className="text-slate-100 font-bold text-xs uppercase tracking-wider">Campus Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              University inquiries or student support assistance:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@campusride.edu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>24/7 Campus Helpline Active</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  VIP Pass
                </span>
                <Link to="/wallet" className="text-amber-400 font-bold hover:underline">
                  0% Fee Upgrade
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusRide Inc. All rights reserved. Built for verified college campuses.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for verified student carpools</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
