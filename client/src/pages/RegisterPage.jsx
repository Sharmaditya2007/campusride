import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { INDIAN_UNIVERSITIES } from '../constants/indianUniversities';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { UserPlus, Mail, Lock, User, GraduationCap, CreditCard, Phone } from 'lucide-react';

const RegisterPage = () => {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem('campusride_signup_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          fullName: parsed.fullName || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          password: '',
          confirmPassword: '',
          university: parsed.university || '',
          customUniversity: parsed.customUniversity || '',
          studentId: parsed.studentId || '',
        };
      }
    } catch (e) {}
    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      university: '',
      customUniversity: '',
      studentId: '',
    };
  });

  // Sync non-sensitive form draft to localStorage
  useEffect(() => {
    try {
      const draftToSave = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        customUniversity: formData.customUniversity,
        studentId: formData.studentId,
      };
      localStorage.setItem('campusride_signup_draft', JSON.stringify(draftToSave));
    } catch (e) {}
  }, [formData.fullName, formData.email, formData.phone, formData.university, formData.customUniversity, formData.studentId]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpMeta, setOtpMeta] = useState(null);

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const isUniversityEmail = (email) => {
    if (!email || !email.includes('@')) return false;
    const clean = email.toLowerCase().trim();
    const domain = clean.split('@')[1] || '';
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.ca', 'yahoo.co.uk',
      'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com',
      'me.com', 'aol.com', 'protonmail.com', 'proton.me', 'zoho.com',
      'yandex.com', 'rediffmail.com', 'mail.com', 'gmx.com'
    ];
    if (personalDomains.includes(domain)) return false;
    return (
      domain.endsWith('.edu') ||
      domain.endsWith('.ac.in') ||
      domain.endsWith('.edu.in') ||
      domain.includes('.edu.') ||
      domain.includes('.ac.') ||
      domain.endsWith('.edu.au') ||
      domain.endsWith('.ac.uk')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUniversityEmail(formData.email)) {
      showToast('Please use your official university email (e.g. student@college.edu.in or @university.ac.in). Personal emails like Gmail or Yahoo are not allowed.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (!PASSWORD_REGEX.test(formData.password)) {
      showToast('Password must be at least 8 characters with upper (A-Z), lower (a-z), number (0-9) & special symbol (!@#$%^&*)', 'error');
      return;
    }

    if (!formData.phone || formData.phone.length < 8) {
      showToast('Please enter a valid mobile phone number for OTP verification.', 'error');
      return;
    }

    const finalUniversity =
      (formData.university || '').includes('Other University') && formData.customUniversity
        ? formData.customUniversity.trim()
        : formData.university;

    const payload = {
      ...formData,
      university: finalUniversity,
    };

    setLoading(true);
    try {
      // Send Email & WhatsApp OTPs
      const res = await api.post('/auth/send-email-otp', payload);
      setLoading(false);

      if (res.data) {
        setOtpMeta(res.data);
      }

      showToast('💬 6-digit OTPs dispatched to your WhatsApp & Email! Please check both.', 'success');
      // Open in-page OTP verification modal seamlessly without redirecting
      setIsModalOpen(true);
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Failed to dispatch verification OTPs. Please check credentials.', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-8">
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Create Student Account</h2>
            <p className="text-xs text-slate-400">One account allows both finding and offering college rides.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Full Name & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student ID / Roll No</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* University Selection */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300 flex justify-between items-center">
                <span>University / College Name ({INDIAN_UNIVERSITIES.length}+ Listed)</span>
                <span className="text-[10px] text-emerald-400 font-normal">Type or Select Any College</span>
              </label>
              
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  list="university-options"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                  required
                />
                <datalist id="university-options">
                  {INDIAN_UNIVERSITIES.map((univ, idx) => (
                    <option key={idx} value={univ} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Mobile Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">University Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. student@university.edu.in or @college.ac.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    required
                  />
                </div>
                <span className="text-[10px] text-amber-400 mt-1 block font-medium">
                  ⚠️ Official university email required (@.edu / @.ac.in). Personal emails (Gmail, Yahoo, etc.) are rejected.
                </span>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 chars (A-z, 0-9, !@#$)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Live Password Strength Requirements Checklist */}
            {formData.password && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs transition-all">
                <div className="font-bold text-slate-300 text-[11px] mb-1">Password Security Policy Requirements:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                  <span className={passwordChecks.length ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                    {passwordChecks.length ? "✓" : "○"} 8+ Characters
                  </span>
                  <span className={passwordChecks.uppercase ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                    {passwordChecks.uppercase ? "✓" : "○"} 1 Uppercase (A-Z)
                  </span>
                  <span className={passwordChecks.lowercase ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                    {passwordChecks.lowercase ? "✓" : "○"} 1 Lowercase (a-z)
                  </span>
                  <span className={passwordChecks.number ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                    {passwordChecks.number ? "✓" : "○"} 1 Number (0-9)
                  </span>
                  <span className={passwordChecks.special ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                    {passwordChecks.special ? "✓" : "○"} 1 Symbol (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                'Send OTP & Verify Student Badge'
              )}
            </button>

          </form>

          <p className="text-xs text-center text-slate-400 pt-2 border-t border-slate-800/80">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Log In
            </Link>
          </p>

        </div>
      </div>

      {/* In-Page OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        otpMeta={otpMeta}
      />
    </MainLayout>
  );
};

export default RegisterPage;
