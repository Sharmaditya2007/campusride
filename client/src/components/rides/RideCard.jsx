import React from 'react';
import { Link } from 'react-router-dom';
import MatchScoreBadge from './MatchScoreBadge';
import UserAvatar from '../common/UserAvatar';
import { ShieldCheck, MapPin, Clock, Users, Car, ChevronRight, Star } from 'lucide-react';

const RideCard = ({ ride, onRequest }) => {
  const driver = ride.driverId || {};
  const vehicle = ride.vehicleId || {};

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      
      {/* Top Bar: Driver & Match Score */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <UserAvatar
            user={driver}
            className="w-11 h-11 rounded-xl ring-2 ring-emerald-500/30 text-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-100 text-sm">{driver.fullName || 'Verified Student Driver'}</h4>
              {driver.verificationStatus === 'verified' && (
                <span title="College & Driver Verified Student">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20 inline" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center text-amber-400 font-medium gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {driver.rating || 5.0} ({driver.ratingCount || 12})
              </span>
              <span>•</span>
              <span className="text-slate-400">{driver.university || 'State University'}</span>
            </div>
          </div>
        </div>

        {ride.matchScore !== undefined && (
          <MatchScoreBadge score={ride.matchScore} />
        )}
      </div>

      {/* Route Timeline */}
      <div className="py-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <div className="w-0.5 h-7 bg-slate-800 my-0.5" />
            <MapPin className="w-4 h-4 text-rose-500" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Pickup Point</p>
              <p className="text-sm font-semibold text-slate-200">{ride.source}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Dropoff Destination</p>
              <p className="text-sm font-semibold text-slate-200">{ride.destination}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Specs Pills */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-800/60 my-2 text-xs">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60">
          <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Time
          </span>
          <span className="font-bold text-slate-200 mt-0.5">{ride.departureTime}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60">
          <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Users className="w-3 h-3 text-teal-400" /> Seats Left
          </span>
          <span className={`font-bold mt-0.5 ${ride.availableSeats > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {ride.availableSeats} of {ride.totalSeats}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60">
          <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Car className="w-3 h-3 text-emerald-400" /> Vehicle
          </span>
          <span className="font-bold text-slate-200 mt-0.5 truncate max-w-[80px]">
            {vehicle.model || 'Car'}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Price & Actions */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Contribution</span>
          <div className="text-lg font-extrabold text-white flex items-baseline gap-1">
            ₹{ride.contribution}
            <span className="text-[11px] font-normal text-slate-400">/ seat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/ride/${ride._id}`}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Details
          </Link>
          <button
            onClick={() => onRequest && onRequest(ride)}
            disabled={ride.availableSeats === 0}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
              ride.availableSeats > 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {ride.availableSeats > 0 ? 'Request Ride' : 'Full'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default RideCard;
