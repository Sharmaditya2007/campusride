import React, { useState } from 'react';
import { ShieldAlert, Phone, Share2, MapPin, AlertCircle, CheckCircle2, X, Activity } from 'lucide-react';

const LiveSOSTrackerModal = ({ isOpen, onClose }) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSosClick = () => {
    setSosTriggered(true);
    setTimeout(() => {
      setSosTriggered(false);
    }, 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://campusride.app/track/live-741298');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Campus Safety & SOS Hub</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 space-y-5">
          
          {/* Live Telemetry Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                GPS 30.7333 N, 76.7794 E
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Current Location</span>
                <span className="font-bold text-white block mt-0.5">Mohali Expressway</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Estimated Speed</span>
                <span className="font-mono font-bold text-emerald-400 block mt-0.5">42 km/h</span>
              </div>
            </div>
          </div>

          {/* Trigger Alert Box */}
          {sosTriggered ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <span className="font-bold block">🚨 Emergency SOS Dispatched!</span>
                <span>GPS Telemetry & SMS sent to Campus Security & Family contacts.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleSosClick}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <ShieldAlert className="w-5 h-5" />
                Trigger 1-Tap SOS Emergency Signal
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              {copied ? 'Copied Link!' : 'Share Live Trip URL'}
            </button>

            <a
              href="tel:112"
              className="py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-4 h-4" />
              Call Campus Security
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveSOSTrackerModal;
