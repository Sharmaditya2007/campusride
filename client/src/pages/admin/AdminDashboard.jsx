import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, FileCheck, AlertTriangle, Check, X, Ban, Car, Eye, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'users' | 'reports'

  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalReports: 0,
  });

  const [platformEarnings, setPlatformEarnings] = useState(null);

  const [verifications, setVerifications] = useState({
    studentVerifications: [],
    driverVerifications: [],
  });

  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);

  // Inspection & Rejection Modals state
  const [inspectDocUrl, setInspectDocUrl] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null); // { id, type: 'student' | 'driver' }
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAdminData = async () => {
    try {
      const sRes = await api.get('/admin/dashboard');
      if (sRes.success) setStats(sRes.data);

      const vRes = await api.get('/admin/verifications');
      if (vRes.success) setVerifications(vRes.data);

      const uRes = await api.get('/admin/users');
      if (uRes.success) setUsersList(uRes.data);

      const rRes = await api.get('/admin/reports');
      if (rRes.success) setReports(rRes.data);

      const pRes = await api.get('/payments/admin/platform-earnings');
      if (pRes.success) setPlatformEarnings(pRes.data);
    } catch (err) {
      console.warn('[Admin] Data fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveStudent = async (id) => {
    try {
      await api.put(`/admin/verifications/student/${id}/approve`);
      showToast('Student ID verification APPROVED! Verified badge granted.', 'success');
      setVerifications((prev) => ({
        ...prev,
        studentVerifications: prev.studentVerifications.filter((v) => v._id !== id),
      }));
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      if (rejectingItem.type === 'student') {
        await api.put(`/admin/verifications/student/${rejectingItem.id}/reject`, { reason: rejectionReason || 'Document image unclear' });
        showToast('Student ID verification rejected with notice sent.', 'info');
        setVerifications((prev) => ({
          ...prev,
          studentVerifications: prev.studentVerifications.filter((v) => v._id !== rejectingItem.id),
        }));
      } else {
        await api.put(`/admin/verifications/driver/${rejectingItem.id}/reject`, { reason: rejectionReason || 'Licence document invalid' });
        showToast('Driver licence verification rejected.', 'info');
        setVerifications((prev) => ({
          ...prev,
          driverVerifications: prev.driverVerifications.filter((v) => v._id !== rejectingItem.id),
        }));
      }
    } catch (err) {
      showToast(err.message || 'Rejection action failed', 'error');
    } finally {
      setRejectingItem(null);
      setRejectionReason('');
    }
  };

  const handleApproveDriver = async (id) => {
    try {
      await api.put(`/admin/verifications/driver/${id}/approve`);
      showToast('Driver licence APPROVED! Driver eligibility granted.', 'success');
      setVerifications((prev) => ({
        ...prev,
        driverVerifications: prev.driverVerifications.filter((v) => v._id !== id),
      }));
    } catch (err) {
      showToast(err.message || 'Driver approval failed', 'error');
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-suspend`);
      showToast('User account suspension status updated.', 'info');
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
    } catch (err) {
      showToast(err.message || 'Suspension toggle failed', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Campus Operations & Safety Admin Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Moderation Control Center</h1>
          </div>

          {/* Admin Tabs */}
          <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 text-xs font-bold shrink-0">
            {['overview', 'verifications', 'users', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl capitalize transition-all ${
                  activeTab === tab ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border-slate-800">
                <span className="text-slate-400 text-xs">Total Users</span>
                <span className="text-2xl font-black text-white block mt-1">{stats.totalUsers}</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800">
                <span className="text-slate-400 text-xs">Verified Students</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{stats.verifiedUsers}</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800">
                <span className="text-slate-400 text-xs">Pending Approvals</span>
                <span className="text-2xl font-black text-amber-400 block mt-1">{stats.pendingVerifications}</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800">
                <span className="text-slate-400 text-xs">Total Rides Posted</span>
                <span className="text-2xl font-black text-teal-400 block mt-1">{stats.totalRides}</span>
              </div>
            </div>

            {/* Financial Revenue Card */}
            {platformEarnings && (
              <div className="glass-card p-6 rounded-3xl border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Platform Revenue & Commission
                  </span>
                  <div className="text-3xl font-black text-white">₹{platformEarnings.totalPlatformCommission}</div>
                  <p className="text-xs text-slate-400">Total Transaction Volume: ₹{platformEarnings.totalTransactionVolume}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Completed Transactions</span>
                    <span className="font-bold text-white text-base">{platformEarnings.totalPaidTransactions}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verifications Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            
            {/* Student Verifications */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pending Student ID Approvals ({verifications.studentVerifications.length})
              </h3>
              {verifications.studentVerifications.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                  No pending student ID verification requests.
                </div>
              ) : (
                verifications.studentVerifications.map((v) => (
                  <div key={v._id} className="glass-card p-5 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.userId?.fullName || 'Student'}</h4>
                      <p className="text-slate-400">{v.userId?.university} • ID: <span className="font-mono text-emerald-400">{v.userId?.studentId}</span></p>
                      <p className="text-[11px] text-slate-500 mt-1">Submitted: {new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.documentUrl && (
                        <button
                          onClick={() => setInspectDocUrl(v.documentUrl)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" /> View ID Card
                        </button>
                      )}
                      <button
                        onClick={() => handleApproveStudent(v._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve ID
                      </button>
                      <button
                        onClick={() => setRejectingItem({ id: v._id, type: 'student' })}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-red-400 font-bold hover:bg-red-950/40 border border-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Driver Licence Verifications */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-teal-400" /> Pending Driver Licence Approvals ({verifications.driverVerifications.length})
              </h3>
              {verifications.driverVerifications.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                  No pending driver licence verification requests.
                </div>
              ) : (
                verifications.driverVerifications.map((d) => (
                  <div key={d._id} className="glass-card p-5 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{d.userId?.fullName || 'Driver'}</h4>
                      <p className="text-slate-400">Licence No: <span className="font-mono text-emerald-400">{d.licenceNumber}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.licenceDocumentUrl && (
                        <button
                          onClick={() => setInspectDocUrl(d.licenceDocumentUrl)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-400" /> View Licence
                        </button>
                      )}
                      <button
                        onClick={() => handleApproveDriver(d._id)}
                        className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Licence
                      </button>
                      <button
                        onClick={() => setRejectingItem({ id: d._id, type: 'driver' })}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-red-400 font-bold hover:bg-red-950/40 border border-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white">Registered Users & Account Suspensions</h3>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div key={u._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{u.fullName}</span>
                    <span className="text-slate-400 block">{u.email} • {u.university}</span>
                    {u.isSuspended && (
                      <span className="inline-block mt-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                        ACCOUNT SUSPENDED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleSuspend(u._id)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition ${
                      u.isSuspended ? 'bg-emerald-500 text-slate-950' : 'bg-red-950/60 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" /> {u.isSuspended ? 'Unsuspend User' : 'Suspend Account'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Safety Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white">Safety Reports Moderation Queue</h3>
            {reports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                Zero active safety incidents reported. Platform operating safely.
              </div>
            ) : (
              reports.map((rep) => (
                <div key={rep._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>Reported User: {rep.reportedUserId?.fullName || 'User'}</span>
                    <span className="text-amber-400 font-mono">Category: {rep.category}</span>
                  </div>
                  <p className="text-slate-300">{rep.description}</p>
                  <div className="flex justify-between items-center text-slate-500 text-[10px] pt-1">
                    <span>Reporter: {rep.reporterId?.fullName || 'Anonymous'}</span>
                    <span className="text-emerald-400 font-bold uppercase">Status: {rep.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Document Inspection Zoom Modal */}
        {inspectDocUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 relative">
              <button
                onClick={() => setInspectDocUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-white">Document Inspection Viewer</h3>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[70vh] flex items-center justify-center">
                <img src={inspectDocUrl} alt="Inspection Document" className="max-w-full max-h-[65vh] object-contain" />
              </div>
              <button
                onClick={() => setInspectDocUrl(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}

        {/* Rejection Notice Modal */}
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 relative">
              <h3 className="text-base font-extrabold text-white">Specify Rejection Reason</h3>
              <p className="text-xs text-slate-400">
                Provide feedback to the student/driver explaining why their verification was rejected.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document photo is blurry or ID card expired..."
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setRejectingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30"
                >
                  Send Rejection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
