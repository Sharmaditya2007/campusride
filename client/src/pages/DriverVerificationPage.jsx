import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Car, Upload, CheckCircle2, FileCheck } from 'lucide-react';

const DriverVerificationPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [licenceNumber, setLicenceNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/verification/driver', {
        licenceNumber,
        licenceDocumentUrl: documentUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
      });
      if (res.success) {
        showToast('Driver licence submitted for verification!', 'success');
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Driver & Licence Verification</h2>
          <p className="text-xs text-slate-400">
            Submit your driving licence details to offer rides to fellow students.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Driving Licence Number</label>
                <div className="relative">
                  <FileCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={licenceNumber}
                    onChange={(e) => setLicenceNumber(e.target.value)}
                    placeholder="DL-04201198822"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Licence Photo / Document URL</label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://example.com/licence.jpg"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Submitting...' : 'SUBMIT DRIVER LICENCE'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">Licence Verification Pending</h4>
              <p className="text-xs text-slate-400">
                Admin review typically takes under 2 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DriverVerificationPage;
