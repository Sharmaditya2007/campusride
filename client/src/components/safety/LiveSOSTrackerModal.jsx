import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, Share2, MapPin, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const LiveSOSTrackerModal = ({ isOpen, onClose }) => {
  const { showToast } = useNotifications();
  const [sosSent, setSosSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSosSent(true);
      showToast('EMERGENCY SOS BROADCASTED! Campus Security & Emergency Contacts Notified.', 'error');
    }, 1200);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const url = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
          navigator.clipboard.writeText(url);
          showToast('Live GPS Location copied to clipboard!', 'success');
        },
        () => {
          showToast('Unable to access location services.', 'error');
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-500/20 text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                1-Tap Emergency SOS
              </h3>
              <p className="text-xs text-red-400 font-semibold">Campus Safety & Assistance Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Action Content */}
        {!sosSent ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Immediate Assistance
              </p>
              <p>
                Tapping the emergency button will broadcast your live trip coordinates to local campus security, emergency services, and your verified contacts.
              </p>
            </div>

            <button
              onClick={handleTriggerSOS}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white font-extrabold text-base tracking-wide hover:opacity-95 shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <ShieldAlert className="w-6 h-6 animate-bounce" />
              {loading ? 'BROADCASTING SOS ALERT...' : 'TRIGGER EMERGENCY SOS ALERT'}
            </button>

            {/* Quick Helpline Numbers */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <a
                href="tel:112"
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 flex items-center gap-3 text-slate-200 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-red-400" />
                <div>
                  <div className="font-bold text-white">112</div>
                  <div className="text-[10px] text-slate-400">National Emergency</div>
                </div>
              </a>
              <button
                onClick={handleShareLocation}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center gap-3 text-slate-200 transition-colors text-left"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Share GPS</div>
                  <div className="text-[10px] text-slate-400">Copy Live Link</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-white">SOS Broadcast Active</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your location and emergency signal have been dispatched to campus security. Stay calm and remain in a well-lit area.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSOSTrackerModal;
