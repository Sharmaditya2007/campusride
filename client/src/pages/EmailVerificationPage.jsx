import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import { MailCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

const EmailVerificationPage = () => {
  const { showToast } = useNotifications();
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      setVerified(true);
      showToast('University Email Verified! Verified Student Badge unlocked.', 'success');
    } else {
      showToast('Please enter a valid 6-digit OTP code', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Email & OTP Verification</h2>
            <p className="text-xs text-slate-400">Enter 6-digit confirmation code sent to your campus email</p>
          </div>

          {!verified ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Verification Code (OTP)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-bold font-mono tracking-widest text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20"
              >
                VERIFY EMAIL BADGE
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-extrabold text-white">Student Email Verified!</h4>
              <p className="text-xs text-slate-400">Your Verified Student Badge is active across ride searches.</p>
              <Link to="/find-ride" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold inline-block mt-2">
                Browse Campus Rides
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EmailVerificationPage;
