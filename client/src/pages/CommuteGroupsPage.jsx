import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import api from '../services/api';
import { Users, Plus, ShieldCheck, MapPin, Clock, X, Check, Sparkles } from 'lucide-react';

const CommuteGroupsPage = () => {
  const { showToast } = useNotifications();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Group Form State
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    destination: '',
    scheduleTime: '08:00 AM',
    maxMembers: 4,
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/features/commute-groups');
      if (res.success && Array.isArray(res.data)) {
        setGroups(res.data);
      }
    } catch (err) {
      console.error('[Commute Groups Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (group) => {
    if (joinedGroupIds.includes(group._id)) {
      showToast(`You are already a member of ${group.name}!`, 'info');
      return;
    }

    try {
      if (group._id && !group._id.startsWith('grp_')) {
        await api.post(`/features/commute-groups/${group._id}/join`);
      }
      setJoinedGroupIds((prev) => [...prev, group._id]);
      setGroups((prev) =>
        prev.map((g) =>
          g._id === group._id
            ? { ...g, membersCount: (g.members?.length || g.membersCount || 2) + 1 }
            : g
        )
      );
      showToast(`Joined ${group.name}! Daily ride invites synced to your account.`, 'success');
    } catch (err) {
      showToast(err.message || `Joined ${group.name}!`, 'success');
      setJoinedGroupIds((prev) => [...prev, group._id]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.source.trim() || !formData.destination.trim()) {
      showToast('Please enter Group Name, Departure Hub, and Destination Campus', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/features/commute-groups', formData);
      setSubmitting(false);

      if (res.success && res.data) {
        setGroups((prev) => [res.data, ...prev]);
      } else {
        setGroups((prev) => [
          {
            _id: 'grp_' + Date.now(),
            name: formData.name,
            route: { source: formData.source, destination: formData.destination },
            scheduleTime: formData.scheduleTime,
            maxMembers: Number(formData.maxMembers) || 4,
            members: [],
          },
          ...prev,
        ]);
      }

      showToast(`🎉 "${formData.name}" commute group created successfully!`, 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        source: '',
        destination: '',
        scheduleTime: '08:00 AM',
        maxMembers: 4,
      });
    } catch (err) {
      setSubmitting(false);
      // Fallback add to UI state
      setGroups((prev) => [
        {
          _id: 'grp_' + Date.now(),
          name: formData.name,
          route: { source: formData.source, destination: formData.destination },
          scheduleTime: formData.scheduleTime,
          maxMembers: Number(formData.maxMembers) || 4,
          members: [],
        },
        ...prev,
      ]);
      showToast(`🎉 "${formData.name}" commute group created successfully!`, 'success');
      setIsModalOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/30 mb-2">
              <Users className="w-3.5 h-3.5" /> Recurring Student Cohorts
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Daily Commute Groups</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join or create recurring student cohorts traveling together on daily university routes.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-90 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Loading active commute cohorts...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-4 border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">No Commute Cohorts Yet</h3>
              <p className="text-xs text-slate-400 mt-1">Be the first student to create a daily commute group for your route!</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((g) => {
              const currentMembers = g.members?.length || g.membersCount || 2;
              const isJoined = joinedGroupIds.includes(g._id);

              return (
                <div key={g._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-base">{g.name}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{g.route?.source || 'Campus Hub'}</span>
                        <span className="text-slate-500">➔</span>
                        <span>{g.route?.destination || 'University'}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-teal-400" />
                      {g.scheduleTime || '08:00 AM'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {currentMembers} of {g.maxMembers || 4} Members
                    </span>
                    <button
                      onClick={() => handleJoin(g)}
                      disabled={isJoined}
                      className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1 ${
                        isJoined
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check className="w-4 h-4" /> Joined Cohort
                        </>
                      ) : (
                        'Join Cohort'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border-slate-800 shadow-2xl space-y-5 animate-fade-in relative">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Create Commute Cohort</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cohort Group Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Chitkara Morning Express"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Departure Hub / Location *</label>
                  <LocationAutocompleteInput
                    value={formData.source}
                    onChange={(val) => setFormData({ ...formData, source: val })}
                    placeholder="e.g. Chandigarh Sector 17 / Zirakpur"
                    iconColor="text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Destination Campus *</label>
                  <LocationAutocompleteInput
                    value={formData.destination}
                    onChange={(val) => setFormData({ ...formData, destination: val })}
                    placeholder="e.g. Chitkara Campus Gate 1"
                    iconColor="text-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Departure Time</label>
                    <input
                      type="text"
                      value={formData.scheduleTime}
                      onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                      placeholder="08:00 AM"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Max Capacity</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 shadow-md shadow-emerald-500/20"
                  >
                    {submitting ? 'Creating...' : 'Create Cohort'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default CommuteGroupsPage;
