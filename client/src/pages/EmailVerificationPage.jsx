import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { MailCheck, Phone, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const state = location.state || {};
  const email = state.email || '';
  const phone = state.phone || '';

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!emailOtp || !phoneOtp) {
      showToast('Please enter both Email OTP and Mobile SMS OTP', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/verify-otps', {
        email,
        emailOtp,
        phoneOtp,
      });

      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setVerified(true);
        showToast('✅ Identity & Mobile Phone verified successfully!', 'success');
        setTimeout(() => {
          navigate('/find-ride');
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed. Please check the codes entered.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post('/auth/resend-otps', { email });
      if (res.success) {
        showToast('New OTP codes sent to your Email and Mobile Phone', 'info');
      }
    } catch (err) {
      showToast('Failed to resend OTPs', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Security & Identity OTP Verification</h2>
            <p className="text-xs text-slate-400">
              Check your email inbox & mobile phone to enter your 6-digit verification codes.
            </p>
          </div>

          {!verified ? (
            <form onSubmit={handleVerify} className="space-y-5 text-xs">
              
              {/* Email OTP Field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                  <MailCheck className="w-4 h-4 text-emerald-400" />
                  University Email OTP (Check your inbox)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 6-digit code sent to email"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-bold font-mono tracking-widest text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <span className="text-[10px] text-slate-500 block text-center">
                  Sent to {email || 'your university email'}
                </span>
              </div>

              {/* Mobile Phone SMS OTP Field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-400" />
                  Mobile Phone SMS OTP (Check mobile messages)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  placeholder="Enter 6-digit code sent to phone"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-bold font-mono tracking-widest text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <span className="text-[10px] text-slate-500 block text-center">
                  Sent via SMS to {phone || 'your mobile number'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  'VERIFY STUDENT BADGE & CONTINUE'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Codes
                </button>
              </div>

            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xl font-extrabold text-white">Student Account Verified!</h4>
              <p className="text-xs text-slate-400">
                Your Email and Mobile Phone have been authenticated. Verified Student Badge unlocked!
              </p>
              <Link
                to="/find-ride"
                className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold inline-block"
              >
                Browse Campus Rides Now
              </Link>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default EmailVerificationPage;
