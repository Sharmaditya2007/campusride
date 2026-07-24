import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markAllRead } = useNotifications();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
            <p className="text-xs text-slate-400">Ride updates, request alerts, and campus notifications.</p>
          </div>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 hover:bg-slate-800"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All Read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl border transition-all ${
                n.isRead ? 'glass-card border-slate-800' : 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
