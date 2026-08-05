import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { ShieldCheck, Mail, CheckCircle2, RefreshCw, AlertCircle, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const state = location.state || {};
  const email = state.email || '';
  const phone = state.phone || '';
  
  const [whatsAppUrl, setWhatsAppUrl] = useState(state.whatsAppUrl || '');
  const [emailOtpDemo, setEmailOtpDemo] = useState(state.emailOtpDemo || '');
  const [whatsappOtpDemo, setWhatsappOtpDemo] = useState(state.whatsappOtpDemo || '');

  // Verification States
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  // Complete Signup Loading State
  const [completing, setCompleting] = useState(false);

  // Resend Timers & Attempts (60-second cooldowns, max 3 attempts)
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailAttemptsLeft, setEmailAttemptsLeft] = useState(3);

  const [whatsappCooldown, setWhatsappCooldown] = useState(0);
  const [whatsappAttemptsLeft, setWhatsappAttemptsLeft] = useState(3);

  // Fallback WhatsApp Intent URL Generator
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const activeWhatsAppUrl = whatsAppUrl || (formattedPhone ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent('🔑 *CampusRide Security OTP*: Verification for ' + (email || 'Student'))}` : '');

  // 60-Second Cooldown Timer effect
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let timer;
    if (whatsappCooldown > 0) {
      timer = setInterval(() => setWhatsappCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [whatsappCooldown]);

  // Step 2a: Verify Email OTP independently
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length < 6) {
      showToast('Please enter the 6-digit Email OTP code', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post('/auth/verify-email-otp', {
        email,
        otp: emailOtp,
      });

      if (res.success) {
        setEmailVerified(true);
        showToast('Email address verified successfully! ✉️', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired Email OTP code.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // Step 2b: Verify WhatsApp OTP independently
  const handleVerifyWhatsapp = async (e) => {
    e.preventDefault();
    if (!whatsappOtp || whatsappOtp.trim().length < 6) {
      showToast('Please enter the 6-digit WhatsApp OTP code', 'error');
      return;
    }

    setWhatsappLoading(true);
    try {
      const res = await api.post('/auth/verify-whatsapp-otp', {
        email,
        otp: whatsappOtp,
      });

      if (res.success) {
        setWhatsappVerified(true);
        showToast('WhatsApp number verified successfully! 💬', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired WhatsApp OTP code.', 'error');
    } finally {
      setWhatsappLoading(false);
    }
  };

  // Step 2c: Resend Email OTP
  const handleResendEmail = async () => {
    if (emailCooldown > 0 || emailAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-email-otp', { email });
      if (res.success) {
        setEmailCooldown(60);
        if (res.data?.emailOtp) setEmailOtpDemo(res.data.emailOtp);
        if (res.data?.resendsLeft !== undefined) {
          setEmailAttemptsLeft(res.data.resendsLeft);
        } else {
          setEmailAttemptsLeft((prev) => prev - 1);
        }
        showToast('New 6-digit Email OTP code sent!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend Email OTP.', 'error');
    }
  };

  // Step 2d: Resend WhatsApp OTP
  const handleResendWhatsapp = async () => {
    if (whatsappCooldown > 0 || whatsappAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-whatsapp-otp', { email });
      if (res.success) {
        setWhatsappCooldown(60);
        if (res.data?.whatsAppUrl) setWhatsAppUrl(res.data.whatsAppUrl);
        if (res.data?.whatsappOtp) setWhatsappOtpDemo(res.data.whatsappOtp);
        if (res.data?.resendsLeft !== undefined) {
          setWhatsappAttemptsLeft(res.data.resendsLeft);
        } else {
          setWhatsappAttemptsLeft((prev) => prev - 1);
        }
        showToast('New 6-digit WhatsApp OTP code sent!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend WhatsApp OTP.', 'error');
    }
  };

  // Step 3: Complete Account Registration (Only when BOTH are verified)
  const handleCompleteRegistration = async () => {
    if (!emailVerified || !whatsappVerified) {
      showToast('You must verify BOTH Email address and WhatsApp number before account creation.', 'error');
      return;
    }

    setCompleting(true);
    try {
      const res = await api.post('/auth/complete-signup', { email });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        showToast('🎉 Account created & verified successfully! Welcome to CampusRide.', 'success');
        setTimeout(() => {
          window.location.href = '/find-ride';
        }, 1200);
      }
    } catch (err) {
      showToast(err.message || 'Account registration completion failed.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const isBothVerified = emailVerified && whatsappVerified;

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Pre-Registration Dual OTP Verification</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Verify both your <span className="text-emerald-400 font-bold">University Email</span> and <span className="text-emerald-400 font-bold">WhatsApp Number</span> to create your student account.
          </p>
        </div>

        {/* Status Tracker Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center justify-between ${emailVerified ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Email Status:
            </span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider">{emailVerified ? 'VERIFIED' : 'PENDING'}</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${whatsappVerified ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center gap-1.5">
              💬 WhatsApp Status:
            </span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider">{whatsappVerified ? 'VERIFIED' : 'PENDING'}</span>
          </div>
        </div>

        {/* Verification Card 1: Email Verification */}
        <div className={`glass-card p-6 rounded-3xl border transition space-y-4 text-xs ${emailVerified ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              1. Verify Email Address ({email || 'student@university.edu'})
            </h3>
            {emailVerified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            )}
          </div>

          {emailOtpDemo && !emailVerified && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
              Generated Email OTP: <span className="font-extrabold text-sm">{emailOtpDemo}</span>
            </div>
          )}

          {!emailVerified ? (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 6-digit Email OTP"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono font-bold text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1 shrink-0"
                >
                  {emailLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Attempts left: {emailAttemptsLeft}/3</span>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={emailCooldown > 0 || emailAttemptsLeft <= 0}
                  className="text-emerald-400 font-bold hover:underline disabled:opacity-40 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend Email OTP'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-emerald-400 text-xs font-semibold">Email verified! Standard student domain check complete.</p>
          )}
        </div>

        {/* Verification Card 2: WhatsApp Verification */}
        <div className={`glass-card p-6 rounded-3xl border transition space-y-4 text-xs ${whatsappVerified ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              💬 2. Verify WhatsApp Number ({phone || 'WhatsApp Phone'})
            </h3>
            {whatsappVerified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            )}
          </div>

          {whatsappOtpDemo && !whatsappVerified && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
              Generated WhatsApp OTP: <span className="font-extrabold text-sm">{whatsappOtpDemo}</span>
            </div>
          )}

          {!whatsappVerified ? (
            <form onSubmit={handleVerifyWhatsapp} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={whatsappOtp}
                  onChange={(e) => setWhatsappOtp(e.target.value)}
                  placeholder="Enter 6-digit WhatsApp OTP"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono font-bold text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={whatsappLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1 shrink-0"
                >
                  {whatsappLoading ? 'Verifying...' : 'Verify WhatsApp'}
                </button>
              </div>

              {/* Direct WhatsApp Link Button */}
              {activeWhatsAppUrl && (
                <a
                  href={activeWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition text-center shadow-md"
                >
                  💬 Receive / Open OTP in WhatsApp
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Attempts left: {whatsappAttemptsLeft}/3</span>
                <button
                  type="button"
                  onClick={handleResendWhatsapp}
                  disabled={whatsappCooldown > 0 || whatsappAttemptsLeft <= 0}
                  className="text-emerald-400 font-bold hover:underline disabled:opacity-40 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {whatsappCooldown > 0 ? `Resend in ${whatsappCooldown}s` : 'Resend WhatsApp OTP'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-emerald-400 text-xs font-semibold">WhatsApp number verified! Mobile identity confirmed.</p>
          )}
        </div>

        {/* Final Account Creation Trigger */}
        <button
          onClick={handleCompleteRegistration}
          disabled={!isBothVerified || completing}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-xl ${
            isBothVerified
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30 hover:opacity-90 cursor-pointer animate-pulse'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              {isBothVerified ? '🎉 CREATE OFFICIAL STUDENT ACCOUNT & LOG IN' : 'VERIFY BOTH OTPS TO CREATE ACCOUNT'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </MainLayout>
  );
};

export default VerifyAccountPage;
