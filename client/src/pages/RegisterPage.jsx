import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { INDIAN_UNIVERSITIES } from '../constants/indianUniversities';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import LiveSelfieModal from '../components/auth/LiveSelfieModal';
import { validateHumanFace } from '../services/faceValidationService';
import { UserPlus, Mail, Lock, User, GraduationCap, CreditCard, Phone, Camera, CheckCircle2, ShieldCheck, Upload, RefreshCw } from 'lucide-react';

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

  const [profileImage, setProfileImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [analyzingFace, setAnalyzingFace] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);

  // Handle Uploaded File with AI Face Detection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB', 'error');
      return;
    }

    setAnalyzingFace(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      // Run AI Face Detection
      const aiResult = await validateHumanFace(base64);
      setAnalyzingFace(false);

      if (!aiResult.isValid) {
        showToast(aiResult.reason || '⚠️ No valid human face detected in uploaded photo. Please upload a clear student face selfie.', 'error');
        setIsFaceVerified(false);
        return;
      }

      setProfileImage(base64);
      setImagePreview(base64);
      setIsFaceVerified(true);
      showToast('✅ Real Human Face Verified!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Live Selfie Capture from Webcam
  const handleSelfieCapture = (capturedBase64) => {
    setProfileImage(capturedBase64);
    setImagePreview(capturedBase64);
    setIsFaceVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage || !isFaceVerified) {
      showToast('⚠️ Please upload or snap a verified student profile picture before continuing.', 'error');
      return;
    }

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

    const payload = {
      ...formData,
      university: finalUniversity,
      profileImage,
    };

    setLoading(true);
    try {
      // Send Email OTP
      await api.post('/auth/send-email-otp', payload);
      setLoading(false);

      showToast('🔑 6-digit Email OTP sent to your university email address!', 'success');
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

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* AI Face Verified Profile Picture Section */}
            <div className="flex flex-col items-center justify-center space-y-3 pb-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/60 flex items-center justify-center bg-slate-900 overflow-hidden shadow-lg shadow-emerald-500/10">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 text-center p-2">
                    <Camera className="w-6 h-6 mb-1 text-emerald-400" />
                    <span className="text-[10px] font-extrabold text-slate-400">No Photo</span>
                  </div>
                )}

                {analyzingFace && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-emerald-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="text-center space-y-1">
                {isFaceVerified ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/40 flex items-center gap-1.5 justify-center mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Real Human Face Verified
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Mandatory AI Human Face Verification
                  </span>
                )}
              </div>

              {/* Action Buttons: Dual Option (Upload File or Snap Selfie) */}
              <div className="flex items-center gap-2 w-full max-w-xs pt-1">
                <label className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  📁 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsSelfieModalOpen(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                >
                  <Camera className="w-3.5 h-3.5" />
                  📸 Snap Selfie
                </button>
              </div>
            </div>

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
                <label className="block font-semibold text-slate-300 mb-1">University Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

      {/* Live Webcam Selfie Capture Modal */}
      <LiveSelfieModal
        isOpen={isSelfieModalOpen}
        onClose={() => setIsSelfieModalOpen(false)}
        onCapture={handleSelfieCapture}
      />

      {/* In-Page OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
      />
    </MainLayout>
  );
};

export default RegisterPage;
