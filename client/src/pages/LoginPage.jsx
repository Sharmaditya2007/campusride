import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogIn, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Logged in successfully! Welcome back to CampusRide.', 'success');
      navigate('/find-ride');
    } else {
      showToast(res.message || 'Login failed. Please check credentials.', 'error');
    }
  };

  const fillDemoStudent = () => {
    setEmail('aditya@student.edu');
    setPassword('student123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@campusride.edu');
    setPassword('admin123');
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Student & Driver Login</h2>
            <p className="text-xs text-slate-400">Access your verified campus carpool network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:opacity-90 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to CampusRide'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-500 block text-center font-medium">Quick Demo Accounts</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold border border-slate-800 text-center"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold border border-slate-800 text-center"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-slate-400 pt-2">
            Don't have a verified account?{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Sign Up Now
            </Link>
          </p>

        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
