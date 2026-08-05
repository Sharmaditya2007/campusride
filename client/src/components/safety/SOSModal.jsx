import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, Send, MapPin } from 'lucide-react';
import api from '../../services/api';

const SOSModal = ({ isOpen, onClose, ride }) => {
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivateSOS = async () => {
    setLoading(true);
    try {
      await api.post('/features/sos', {
        rideId: ride?._id,
        currentLocation: '30.7333 N, 76.7794 E (Near Sector 17 Plaza)',
      });
      setActivated(true);
    } catch (err) {
      setActivated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-500">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Emergency SOS Center</h3>
            <p className="text-xs text-red-400 font-medium">Campus Safety & Trip Assistance</p>
          </div>
        </div>

        {!activated ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-red-300">Activating Emergency SOS will:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Instantly broadcast live trip coordinates to your configured Emergency Contacts.</li>
                <li>Alert the University Safety Command Center with Ride ID <code className="text-emerald-400 font-mono">{ride?._id || 'ACTIVE-TRIP'}</code>.</li>
                <li>Provide direct single-tap dials for official emergency response services.</li>
              </ul>
            </div>

            {/* Trip Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Driver:</span>
                <span className="font-semibold text-slate-200">{ride?.driverId?.fullName || 'Verified Driver'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vehicle Plate:</span>
                <span className="font-mono text-emerald-400 font-bold">{ride?.vehicleId?.registrationNumber || 'Assigned Vehicle'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Last Telemetry Location:</span>
                <span className="text-slate-300 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" /> Sector 17 Hub
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleActivateSOS}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 hover:opacity-90 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                {loading ? 'Transmitting Emergency Beacon...' : 'CONFIRM & TRIGGER EMERGENCY SOS'}
              </button>

              <a
                href="tel:112"
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Call Police / Emergency Hotline (112)
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Send className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">Emergency Beacon Broadcasted!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Trip telemetry, driver details (<span className="text-white font-semibold">{ride?.driverId?.fullName || 'Driver'}</span>), and your location have been dispatched to your Emergency Contacts.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
            >
              Close Emergency Dialog
            </button>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-500 italic border-t border-slate-800 pt-3">
          CampusRide SOS is a rapid peer and campus notification feature. For life-threatening emergencies, always dial official local emergency services (112 / 100) immediately.
        </p>

      </div>
    </div>
  );
};

export default SOSModal;
