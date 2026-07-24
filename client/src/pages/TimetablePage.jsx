import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Calendar, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimetablePage = () => {
  const { showToast } = useNotifications();
  const [timetable, setTimetable] = useState([
    { day: 'Monday', firstClassStart: '09:00', lastClassEnd: '16:30' },
    { day: 'Tuesday', firstClassStart: '09:00', lastClassEnd: '15:00' },
    { day: 'Wednesday', firstClassStart: '10:00', lastClassEnd: '17:00' },
    { day: 'Thursday', firstClassStart: '09:00', lastClassEnd: '16:00' },
    { day: 'Friday', firstClassStart: '09:00', lastClassEnd: '14:30' },
  ]);

  const [matches, setMatches] = useState([
    { student: 'Aman (Senior CS)', route: 'Mohali Sector 70 ➔ Campus Gate 1', departure: '08:15 AM (Matches 09:00 Class)' },
    { student: 'Priya (ECE)', route: 'Sector 17 ➔ Engineering Block', departure: '08:30 AM (Matches 09:00 Class)' },
  ]);

  const handleSaveTimetable = async () => {
    try {
      await api.put('/features/timetable', { schedule: timetable });
      showToast('Timetable saved! Automatic commute window suggestions refreshed.', 'success');
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Timetable Commute Match</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Set your weekly class start and end times to automatically discover compatible carpool windows.
          </p>
        </div>

        {/* Timetable Form Card */}
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="space-y-3">
            {timetable.map((t, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                <span className="font-extrabold text-white text-sm">{t.day}</span>
                <div>
                  <label className="block text-slate-400 text-[10px]">First Class Starts</label>
                  <input
                    type="time"
                    value={t.firstClassStart}
                    onChange={(e) => {
                      const updated = [...timetable];
                      updated[idx].firstClassStart = e.target.value;
                      setTimetable(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Last Class Ends</label>
                  <input
                    type="time"
                    value={t.lastClassEnd}
                    onChange={(e) => {
                      const updated = [...timetable];
                      updated[idx].lastClassEnd = e.target.value;
                      setTimetable(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveTimetable}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20"
          >
            SAVE TIMETABLE & GENERATE MATCHES
          </button>
        </div>

        {/* Matches Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Automated Timetable Ride Matches
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white">
                  <span>{m.student}</span>
                  <span className="text-emerald-400">95% Time Match</span>
                </div>
                <p className="text-slate-300">{m.route}</p>
                <p className="text-slate-400 font-mono">{m.departure}</p>
                <Link to="/find-ride" className="px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 font-bold inline-block mt-1">
                  Request Ride <ArrowRight className="w-3.5 h-3.5 inline" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default TimetablePage;
