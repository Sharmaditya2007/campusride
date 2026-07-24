import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Users, Plus, ShieldCheck, MapPin, Clock } from 'lucide-react';

const CommuteGroupsPage = () => {
  const { showToast } = useNotifications();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/features/commute-groups');
        if (res.success) setGroups(res.data);
      } catch (err) {}
    };
    fetchGroups();
  }, []);

  const handleJoin = (groupName) => {
    showToast(`Joined ${groupName}! Ride invites synced to your dashboard.`, 'success');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Daily Commute Groups</h1>
            <p className="text-xs text-slate-400">Join recurring student cohorts traveling together daily.</p>
          </div>
          <button
            onClick={() => showToast('Group creation form initialized', 'info')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:bg-teal-400"
          >
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div key={g._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-white text-base">{g.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {g.route?.source} ➔ {g.route?.destination}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold">
                  {g.scheduleTime || '08:00 AM'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">{g.members?.length || 2} of {g.maxMembers || 4} Members</span>
                <button
                  onClick={() => handleJoin(g.name)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold"
                >
                  Join Cohort
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  );
};

export default CommuteGroupsPage;
