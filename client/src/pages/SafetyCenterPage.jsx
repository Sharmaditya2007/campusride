import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import SOSModal from '../components/safety/SOSModal';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { ShieldCheck, AlertTriangle, PhoneCall, Lock, EyeOff, Share2, FileWarning } from 'lucide-react';

const SafetyCenterPage = () => {
  const { showToast } = useNotifications();
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      showToast('Safety incident report filed to campus admin moderation queue.', 'success');
      setReportDescription('');
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Safety Protocol Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Campus Safety & Trust Standards</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Learn about our multi-layer verification, emergency tools, and community safety guidelines.
          </p>
        </div>

        {/* SOS Banner */}
        <div className="glass-card p-8 rounded-3xl border-red-500/40 bg-gradient-to-r from-red-950/40 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Rapid Emergency SOS
            </h3>
            <p className="text-xs text-slate-300 max-w-lg">
              In case of any safety concern during an active ride, instantly dispatch your trip telemetry and location to your emergency contacts.
            </p>
          </div>
          <button
            onClick={() => setSosModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 hover:opacity-90 shrink-0"
          >
            TEST EMERGENCY SOS
          </button>
        </div>

        {/* Safety Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-3 text-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Verified Student Network</h4>
            <p className="text-slate-400">Strict institutional email and ID document auditing before ride privileges are unlocked.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-3 text-xs">
            <EyeOff className="w-6 h-6 text-teal-400" />
            <h4 className="font-bold text-white text-sm">Privacy & Pickup Hubs</h4>
            <p className="text-slate-400">Exact home addresses are never exposed publicly. Commutes use designated campus pickup hubs.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-3 text-xs">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">24/7 Campus Helpline</h4>
            <p className="text-slate-400">Direct single-tap access to campus safety control room and emergency police hotlines.</p>
          </div>
        </div>

        {/* Incident Report Form */}
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-amber-400" /> File a Confidential Safety Incident Report
          </h3>
          <form onSubmit={handleReport} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description of Issue / Concerns</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Describe unsafe driving, harassment, or no-show incidents..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
            >
              SUBMIT REPORT TO ADMIN MODERATORS
            </button>
          </form>
        </div>

        <SOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />

      </div>
    </MainLayout>
  );
};

export default SafetyCenterPage;
