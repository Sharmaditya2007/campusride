import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, FileCheck, AlertTriangle, Check, X, Ban, Car } from 'lucide-react';

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

  const [verifications, setVerifications] = useState({
    studentVerifications: [],
    driverVerifications: [],
  });

  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
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
      } catch (err) {}
    };

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
    } catch (err) {}
  };

  const handleRejectStudent = async (id) => {
    try {
      await api.put(`/admin/verifications/student/${id}/reject`, { reason: 'Document image unclear' });
      showToast('Student ID verification rejected.', 'info');
      setVerifications((prev) => ({
        ...prev,
        studentVerifications: prev.studentVerifications.filter((v) => v._id !== id),
      }));
    } catch (err) {}
  };

  const handleApproveDriver = async (id) => {
    try {
      await api.put(`/admin/verifications/driver/${id}/approve`);
      showToast('Driver licence APPROVED! Driver eligibility granted.', 'success');
      setVerifications((prev) => ({
        ...prev,
        driverVerifications: prev.driverVerifications.filter((v) => v._id !== id),
      }));
    } catch (err) {}
  };

  const handleToggleSuspend = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-suspend`);
      showToast('User account suspension status updated.', 'info');
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
    } catch (err) {}
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Moderation Dashboard</h1>
          </div>

          {/* Admin Tabs */}
          <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 text-xs font-bold">
            {['overview', 'verifications', 'users', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl capitalize transition-all ${
                  activeTab === tab ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
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
              {verifications.studentVerifications.map((v) => (
                <div key={v._id} className="glass-card p-5 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{v.userId?.fullName}</h4>
                    <p className="text-slate-400">{v.userId?.university} • ID: <span className="font-mono text-emerald-400">{v.userId?.studentId}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveStudent(v._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve ID
                    </button>
                    <button
                      onClick={() => handleRejectStudent(v._id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Driver Licence Verifications */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-teal-400" /> Pending Driver Licence Approvals ({verifications.driverVerifications.length})
              </h3>
              {verifications.driverVerifications.map((d) => (
                <div key={d._id} className="glass-card p-5 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{d.userId?.fullName}</h4>
                    <p className="text-slate-400">Licence No: <span className="font-mono text-emerald-400">{d.licenceNumber}</span></p>
                  </div>
                  <button
                    onClick={() => handleApproveDriver(d._id)}
                    className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Licence
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white">Registered Users & Suspensions</h3>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div key={u._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{u.fullName}</span>
                    <span className="text-slate-400 block">{u.email} • {u.university}</span>
                  </div>

                  <button
                    onClick={() => handleToggleSuspend(u._id)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ${
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
            {reports.map((rep) => (
              <div key={rep._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white">
                  <span>Reported User: {rep.reportedUserId?.fullName}</span>
                  <span className="text-amber-400 font-mono">Category: {rep.category}</span>
                </div>
                <p className="text-slate-300">{rep.description}</p>
                <span className="text-slate-500 block text-[10px]">Reporter: {rep.reporterId?.fullName}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
