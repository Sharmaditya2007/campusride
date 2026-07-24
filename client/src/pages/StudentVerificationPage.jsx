import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const StudentVerificationPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/verification/student', {
        verificationType: 'id_card',
        documentUrl: documentUrl || 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?auto=format&fit=crop&q=80&w=400',
      });
      if (res.success) {
        showToast('Student ID verification submitted for admin review!', 'success');
        setSubmitted(true);
      }
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Student ID Verification</h2>
          <p className="text-xs text-slate-400">
            Verify your identity to earn your Verified Student Badge and unlock full platform capabilities.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Current Account Status:</span>
              <span className="font-extrabold text-white capitalize">{user?.verificationStatus || 'unverified'}</span>
            </div>
            {user?.verificationStatus === 'verified' ? (
              <span className="px-3 py-1 rounded-full badge-verified text-slate-950 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Badge Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                Action Required
              </span>
            )}
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student ID Document Image URL</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://example.com/student-id-photo.jpg"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Supports JPG, PNG images of university roll card or library ID pass.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Submitting Document...' : 'SUBMIT ID FOR ADMIN APPROVAL'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">Verification Under Review</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your submitted ID card document is currently being reviewed by campus safety admins. You will receive an in-app alert upon approval.
              </p>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default StudentVerificationPage;
