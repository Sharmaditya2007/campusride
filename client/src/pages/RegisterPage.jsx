import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { INDIAN_UNIVERSITIES } from '../constants/indianUniversities';
import { UserPlus, Mail, Lock, User, GraduationCap, CreditCard, Phone, Search } from 'lucide-react';

const RegisterPage = () => {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    university: '',
    customUniversity: '',
    studentId: '',
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredUniversities = INDIAN_UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (!formData.phone || formData.phone.length < 8) {
      showToast('Please enter a valid mobile phone number for OTP verification.', 'error');
      return;
    }

    const finalUniversity =
      formData.university.includes('Other University') && formData.customUniversity
        ? formData.customUniversity.trim()
        : formData.university;

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        ...formData,
        university: finalUniversity,
      });
      setLoading(false);

      if (res.success) {
        showToast('Registration successful! Verification OTPs sent to your Email and Mobile Phone.', 'success');
        navigate('/verify-email', {
          state: {
            email: formData.email,
            phone: formData.phone,
          },
        });
      }
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Registration failed.', 'error');
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
            
            {/* Full Name & Roll No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Kumar"
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
                    placeholder="e.g. 24CAI1104"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* University Selection with Filter */}
            {/* University Selection with Searchable Datalist */}
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
                  placeholder="Type or select your university (e.g. Chitkara, CU, DU, VIT, LPU, IIT...)"
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
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">University Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@university.edu.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
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
                    placeholder="••••••••"
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
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
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
    </MainLayout>
  );
};

export default RegisterPage;
