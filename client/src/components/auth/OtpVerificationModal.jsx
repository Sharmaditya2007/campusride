import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, CheckCircle2, RefreshCw, X, ArrowRight, ExternalLink, Smartphone } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const OtpVerificationModal = ({ isOpen, onClose, formData, initialWhatsAppUrl }) => {
  const { showToast } = useNotifications();

  // Masking Utilities
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  const maskPhone = (str) => {
    if (!str) return str;
    const clean = str.replace(/[^0-9]/g, '');
    if (clean.length < 6) return str;
    return `+91 XXXXX ${clean.slice(-5)}`;
  };

  const email = formData?.email || '';
  const phone = formData?.phone || '';

  // 6-digit OTP States (Array of 6 strings)
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [whatsappOtpDigits, setWhatsappOtpDigits] = useState(['', '', '', '', '', '']);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const [whatsAppUrl, setWhatsAppUrl] = useState(initialWhatsAppUrl || '');
  const [completing, setCompleting] = useState(false);

  // Resend Timers & Attempts (60-second cooldowns, max 3 attempts)
  const [emailCooldown, setEmailCooldown] = useState(60);
  const [emailAttemptsLeft, setEmailAttemptsLeft] = useState(3);

  const [whatsappCooldown, setWhatsappCooldown] = useState(60);
  const [whatsappAttemptsLeft, setWhatsappAttemptsLeft] = useState(3);

  // Refs for 6 individual digit inputs
  const emailInputRefs = useRef([]);
  const whatsappInputRefs = useRef([]);

  // Cooldown Timer Effects
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

  if (!isOpen) return null;

  // Handle 6-Digit Auto-Focus Movement for Email OTP
  const handleEmailDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...emailOtpDigits];
    newDigits[index] = value;
    setEmailOtpDigits(newDigits);

    if (value && index < 5) {
      emailInputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtpDigits[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle 6-Digit Auto-Focus Movement for WhatsApp OTP
  const handleWhatsappDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...whatsappOtpDigits];
    newDigits[index] = value;
    setWhatsappOtpDigits(newDigits);

    if (value && index < 5) {
      whatsappInputRefs.current[index + 1]?.focus();
    }
  };

  const handleWhatsappKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !whatsappOtpDigits[index] && index > 0) {
      whatsappInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify Email OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const fullOtp = emailOtpDigits.join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the complete 6-digit Email OTP code', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post('/auth/verify-email-otp', {
        email,
        otp: fullOtp,
      });

      if (res.success) {
        setEmailVerified(true);
        showToast('University Email address verified successfully! ✉️', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired Email OTP code.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // Verify WhatsApp OTP
  const handleVerifyWhatsapp = async (e) => {
    e.preventDefault();
    const fullOtp = whatsappOtpDigits.join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the complete 6-digit WhatsApp OTP code', 'error');
      return;
    }

    setWhatsappLoading(true);
    try {
      const res = await api.post('/auth/verify-whatsapp-otp', {
        email,
        otp: fullOtp,
      });

      if (res.success) {
        setWhatsappVerified(true);
        showToast('WhatsApp phone number verified successfully! 💬', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired WhatsApp OTP code.', 'error');
    } finally {
      setWhatsappLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendEmail = async () => {
    if (emailCooldown > 0 || emailAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-email-otp', { email });
      if (res.success) {
        setEmailCooldown(60);
        setEmailAttemptsLeft((prev) => Math.max(0, prev - 1));
        setEmailOtpDigits(['', '', '', '', '', '']);
        showToast('New 6-digit Email OTP code dispatched to your inbox!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend Email OTP.', 'error');
    }
  };

  // Resend WhatsApp OTP
  const handleResendWhatsapp = async () => {
    if (whatsappCooldown > 0 || whatsappAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-whatsapp-otp', { email });
      if (res.success) {
        setWhatsappCooldown(60);
        if (res.data?.whatsAppUrl) setWhatsAppUrl(res.data.whatsAppUrl);
        setWhatsappAttemptsLeft((prev) => Math.max(0, prev - 1));
        setWhatsappOtpDigits(['', '', '', '', '', '']);
        showToast('New 6-digit WhatsApp OTP code dispatched!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend WhatsApp OTP.', 'error');
    }
  };

  // Final Action: Create Student Account & Log In
  const handleCreateAccount = async () => {
    if (!emailVerified || !whatsappVerified) {
      showToast('Account creation blocked! Please verify BOTH Email & WhatsApp.', 'error');
      return;
    }

    setCompleting(true);
    try {
      const res = await api.post('/auth/create-account', { email });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        showToast('🎉 Student Account created & verified successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/find-ride';
        }, 1200);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create student account.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const isBothVerified = emailVerified && whatsappVerified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Student Identity Dual OTP Verification</h3>
          <p className="text-xs text-slate-400">
            Verify both your university email and mobile WhatsApp number to unlock your account.
          </p>
        </div>

        {/* Section 1: University Email Verification */}
        <div className={`p-5 rounded-2xl border transition space-y-3 text-xs ${emailVerified ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-400" />
              University Email ({maskEmail(email)})
            </span>
            {emailVerified ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Pending</span>
            )}
          </div>

          {!emailVerified ? (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              {/* 6 Individual OTP Boxes */}
              <div className="flex justify-between gap-1.5 pt-1">
                {emailOtpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (emailInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleEmailDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleEmailKeyDown(idx, e)}
                    className="w-10 h-12 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-center font-mono font-bold text-lg text-emerald-300 focus:outline-none"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={emailCooldown > 0 || emailAttemptsLeft <= 0}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" />
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : `Resend Email OTP (${emailAttemptsLeft}/3)`}
                </button>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition"
                >
                  {emailLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-emerald-400 text-xs font-semibold">✅ Email address verified successfully.</p>
          )}
        </div>

        {/* Section 2: WhatsApp Number Verification */}
        <div className={`p-5 rounded-2xl border transition space-y-3 text-xs ${whatsappVerified ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              WhatsApp Number ({maskPhone(phone)})
            </span>
            {whatsappVerified ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Pending</span>
            )}
          </div>

          {!whatsappVerified ? (
            <form onSubmit={handleVerifyWhatsapp} className="space-y-3">
              {/* 6 Individual OTP Boxes */}
              <div className="flex justify-between gap-1.5 pt-1">
                {whatsappOtpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (whatsappInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleWhatsappDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleWhatsappKeyDown(idx, e)}
                    className="w-10 h-12 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-center font-mono font-bold text-lg text-emerald-300 focus:outline-none"
                  />
                ))}
              </div>

              {/* Direct WhatsApp Action Link */}
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  💬 Receive / Open OTP in WhatsApp
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendWhatsapp}
                  disabled={whatsappCooldown > 0 || whatsappAttemptsLeft <= 0}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" />
                  {whatsappCooldown > 0 ? `Resend in ${whatsappCooldown}s` : `Resend WhatsApp OTP (${whatsappAttemptsLeft}/3)`}
                </button>

                <button
                  type="submit"
                  disabled={whatsappLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition"
                >
                  {whatsappLoading ? 'Verifying...' : 'Verify WhatsApp'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-emerald-400 text-xs font-semibold">✅ WhatsApp number verified successfully.</p>
          )}
        </div>

        {/* Final Button: Create Student Account */}
        <button
          onClick={handleCreateAccount}
          disabled={!isBothVerified || completing}
          className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition shadow-xl ${
            isBothVerified
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/20 hover:opacity-90 cursor-pointer animate-pulse'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              Create Student Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default OtpVerificationModal;
