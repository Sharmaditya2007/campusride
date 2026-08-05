import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { LogIn, Mail, Lock, Smartphone, ShieldCheck, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Mode: 'otp' (Real-Time OTP Login) | 'password' (Classic Password Login)
  const [loginMode, setLoginMode] = useState('otp');

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Real-Time OTP Login State
  const [otpStep, setOtpStep] = useState(1); // 1: Input Identifier, 2: Enter 6-Digit OTP
  const [identifier, setIdentifier] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Handle Classic Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    const res = await loginUser(email, password);
    setPasswordLoading(false);

    if (res.success) {
      showToast('Logged in successfully! Welcome back to CampusRide.', 'success');
      navigate('/find-ride');
    } else {
      showToast(res.message || 'Login failed. Please check credentials.', 'error');
    }
  };

  // Step 1: Request Real-Time OTP to Email/Phone/WhatsApp
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier || identifier.trim().length < 4) {
      showToast('Please enter a valid registered Email address or Phone number', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.post('/auth/send-login-otp', { identifier });
      if (res.success) {
        showToast('Real-Time OTP sent to your Email & WhatsApp!', 'success');
        if (res.data?.whatsAppUrl) {
          setWhatsAppUrl(res.data.whatsAppUrl);
        }
        if (res.data?.emailOtp) {
          setOtpNotice(`OTP Code: ${res.data.emailOtp}`);
        }
        setOtpStep(2);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send OTP. Ensure your email/phone is registered.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP & Log In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length < 6) {
      showToast('Please enter the 6-digit OTP code received on your Email/SMS', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.post('/auth/verify-login-otp', {
        identifier,
        emailOtp,
        phoneOtp: emailOtp,
      });

      if (res.success) {
        // Save JWT token & set user session
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        showToast('Real-Time OTP Verified! Welcome back to CampusRide.', 'success');
        window.location.href = '/find-ride';
      }
    } catch (err) {
      showToast(err.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-10 space-y-6">
        
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Student & Driver Authentication</h2>
            <p className="text-xs text-slate-400">Access your verified campus carpool account</p>
          </div>

          {/* Login Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setLoginMode('otp')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                loginMode === 'otp'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Real-Time OTP Login
            </button>
            <button
              onClick={() => setLoginMode('password')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                loginMode === 'password'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" /> Password Login
            </button>
          </div>

          {/* Mode 1: Real-Time OTP Login */}
          {loginMode === 'otp' ? (
            <div>
              {otpStep === 1 ? (
                /* Step 1: Input Registered Email or Phone */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Email Address or Mobile Phone
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. aditya@student.edu or +91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Real-Time OTP Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Input 6-Digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                  
                  {otpNotice && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
                      {otpNotice}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Enter 6-Digit Verification OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpStep(1)}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Change Email/Phone
                      </button>
                    </div>
                    
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-emerald-500/50 rounded-xl text-center text-lg font-mono tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify OTP & Log In
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Direct WhatsApp OTP Dispatch Link */}
                  {whatsAppUrl && (
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md"
                    >
                      💬 Receive / Open OTP in WhatsApp
                    </a>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Mode 2: Classic Password Login */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">University Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-emerald-400 hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {passwordLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In with Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-xs text-center text-slate-400 pt-2 border-t border-slate-800/80">
            Don't have a verified student account?{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Sign Up Now
            </Link>
          </p>

        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
