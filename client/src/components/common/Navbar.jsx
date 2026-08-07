import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import UserAvatar from './UserAvatar';
import { Car, ShieldCheck, Bell, User, LogOut, Menu, X, PlusCircle, Calendar, Users, Leaf, LayoutDashboard, Wallet, ShieldAlert } from 'lucide-react';
import LiveSOSTrackerModal from './LiveSOSTrackerModal';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logoutUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                Campus<span className="text-emerald-400">Ride</span>
              </span>
              <span className="text-[10px] font-medium text-emerald-500/80 tracking-widest uppercase">Verified Student Carpool</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/find-ride"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/find-ride') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Find a Ride
            </Link>

            <Link
              to="/offer-ride"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/offer-ride') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Offer Ride
            </Link>


            <Link
              to="/commute-groups"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/commute-groups') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Users className="w-4 h-4 text-teal-400" />
              Groups
            </Link>

            <Link
              to="/environmental-impact"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/environmental-impact') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Leaf className="w-4 h-4 text-green-400" />
              Impact
            </Link>

            <Link
              to="/safety"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/safety') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety
            </Link>
          </div>

            {/* User Controls / Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Emergency SOS Quick Button */}
                  <button
                    onClick={() => setSosModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1 transition-all"
                    title="1-Tap SOS Emergency Signal"
                  >
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                    SOS
                  </button>

                  {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500/20 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                {/* User Dropdown/Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link
                    to="/wallet"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 flex items-center gap-1 transition-all"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Wallet
                  </Link>
                  <Link
                    to="/my-rides"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    My Rides
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                  >
                    <UserAvatar
                      user={user}
                      className="w-8 h-8 rounded-lg ring-2 ring-emerald-500/40"
                    />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                        {user?.fullName?.split(' ')[0]}
                        {user?.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">{user?.university?.slice(0, 14)}...</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90 shadow-md shadow-emerald-500/20 transition-all"
                >
                  Verify & Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
            Home
          </Link>
          <Link to="/find-ride" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
            Find a Ride
          </Link>
          <Link to="/offer-ride" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-400">
            + Offer a Ride
          </Link>
          <Link to="/commute-groups" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
            Commute Groups
          </Link>
          <Link to="/environmental-impact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
            Eco Impact Dashboard
          </Link>
          <Link to="/safety" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
            Safety Center
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-rides" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
                My Rides & Bookings
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200">
                Student Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center rounded-xl bg-slate-900 text-slate-200 text-sm font-semibold">
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold">
                Sign Up & Verify Student ID
              </Link>
            </div>
          )}
        </div>
      )}

      <LiveSOSTrackerModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
