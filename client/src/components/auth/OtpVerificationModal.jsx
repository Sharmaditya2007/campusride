import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, CheckCircle2, RefreshCw, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const OtpVerificationModal = ({ isOpen, onClose, formData }) => {
  const { showToast } = useNotifications();

  // Masking Utility
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  const email = formData?.email || '';

  // 6-digit OTP States (Array of 6 strings)
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Resend Timer & Attempts (60-second cooldown, max 3 attempts)
  const [emailCooldown, setEmailCooldown] = useState(60);
  const [emailAttemptsLeft, setEmailAttemptsLeft] = useState(3);

  // Refs for 6 individual digit inputs
  const emailInputRefs = useRef([]);

  // Cooldown Timer Effect
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

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

  // Resend Email OTP
  const handleResendEmail = async () => {
    if (emailCooldown > 0 || emailAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-email-otp', { email });
      if (res.success) {
        setEmailCooldown(60);
        setEmailAttemptsLeft((prev) => Math.max(0, prev - 1));
        setEmailOtpDigits(['', '', '', '', '', '']);
        showToast('New 6-digit Email OTP code dispatched! Please check your inbox & spam folder.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend Email OTP.', 'error');
    }
  };

  // Final Action: Create Student Account & Log In
  const handleCreateAccount = async () => {
    if (!emailVerified) {
      showToast('Please verify your Email OTP code first.', 'error');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
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
          <h3 className="text-xl font-extrabold text-white">University Email OTP Verification</h3>
          <p className="text-xs text-slate-400">
            Verify your student email address to complete setup. Check your <strong>Inbox & Spam / Junk folder</strong>.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>📩 Didn't receive the email yet?</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Master Code: 123456
            </span>
          </div>
        </div>

        {/* University Email Verification Card */}
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

        {/* Final Button: Create Student Account */}
        <button
          onClick={handleCreateAccount}
          disabled={!emailVerified || completing}
          className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition shadow-xl ${
            emailVerified
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
