import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import UserAvatar from '../components/common/UserAvatar';
import { User, ShieldCheck, Star, Award, Phone, MapPin, Plus, Car, Calendar, Edit3 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [emergencyContacts, setEmergencyContacts] = useState(user?.emergencyContacts || []);
  const [savedRoutes, setSavedRoutes] = useState(user?.savedRoutes || []);

  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });
  const [showAddContact, setShowAddContact] = useState(false);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/emergency-contacts', newContact);
      setEmergencyContacts((prev) => [...prev, newContact]);
      showToast('Emergency contact added successfully', 'success');
      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relation: 'Family' });
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card Header */}
        <div className="glass-card p-8 rounded-3xl border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6">
          <UserAvatar
            user={user}
            className="w-24 h-24 rounded-3xl ring-4 ring-emerald-500/30 shrink-0 text-2xl"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  {user?.fullName || 'Aditya Sharma'}
                  {user?.verificationStatus === 'verified' && (
                    <span title="Verified Student Badge">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">{user?.university} • Student ID: <span className="font-mono text-emerald-400">{user?.studentId || 'STU-2026'}</span></p>
              </div>

              <Link
                to="/verify-student"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-850"
              >
                Verification Badge
              </Link>
            </div>

            <p className="text-xs text-slate-300 italic pt-1">
              "{user?.bio || 'Daily commuter exploring carpools to save fuel & meet fellow students!'}"
            </p>

            {/* Stat Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Student Rating</span>
                <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {user?.rating || 4.9}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CampusPoints</span>
                <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5" /> {user?.campusPoints || 250} pts
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rides Offered</span>
                <span className="font-extrabold text-white text-sm mt-0.5 block">{user?.ridesOfferedCount || 0}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rides Taken</span>
                <span className="font-extrabold text-teal-400 text-sm mt-0.5 block">{user?.ridesTakenCount || 0}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Emergency Contacts & Saved Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Emergency Contacts */}
          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> Emergency Contacts
              </h3>
              <button
                onClick={() => setShowAddContact(true)}
                className="p-1.5 rounded-lg bg-slate-900 text-emerald-400 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {emergencyContacts.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">{c.name}</span>
                    <span className="text-slate-400">{c.relation}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Routes */}
          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" /> Saved Daily Routes
              </h3>
              <Link to="/find-ride" className="text-xs text-emerald-400 hover:underline font-bold">Quick Search</Link>
            </div>

            <div className="space-y-2 text-xs">
              {savedRoutes.map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">{r.title}</span>
                  <p className="text-slate-400">{r.source} ➔ {r.destination}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Links Garage & Verification */}
        <div className="text-xs font-bold">
          <Link
            to="/vehicles"
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 flex items-center justify-between"
          >
            <span className="flex items-center gap-2"><Car className="w-4 h-4 text-emerald-400" /> Manage Vehicles</span>
            <span>→</span>
          </Link>
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Add Emergency Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Contact Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Parent / Guardian Name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                  >
                    Save Contact
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

export default ProfilePage;
