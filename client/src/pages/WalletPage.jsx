import React, { useState, useEffect } from 'react';
import { Wallet, Crown, ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const WalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vipLoading, setVipLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/payments/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setWalletData(res.data.data);
      }

      // Check if admin to fetch platform revenue
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        const adminRes = await axios.get(`${API_BASE_URL}/payments/admin/platform-earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (adminRes.data.success) {
          setAdminStats(adminRes.data.data);
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load wallet data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleSubscribeVip = async () => {
    try {
      setVipLoading(true);
      setMsg({ type: '', text: '' });
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/payments/subscribe-vip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMsg({ type: 'success', text: '⭐ CampusRide VIP Pass activated! 0% booking fees enabled.' });
        fetchWallet();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to activate VIP Pass.' });
    } finally {
      setVipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-semibold">Loading Campus Wallet...</span>
        </div>
      </div>
    );
  }

  const { walletBalance = 0, isVipPass = false, vipPassExpiresAt, transactions = [] } = walletData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Campus Wallet & Earnings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your ride payments, driver earnings, and platform subscription.
            </p>
          </div>
          <button
            onClick={fetchWallet}
            className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-slate-300 transition w-max"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Balance
          </button>
        </div>

        {/* Alert Notifications */}
        {msg.text && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
              msg.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {msg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-indigo-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <Wallet className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-white">₹{walletBalance}</div>
            <p className="text-xs text-slate-400 mt-2">
              Usable for instant ride bookings and driver payouts.
            </p>
          </div>

          {/* VIP Pass Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" />
                Campus VIP Pass
              </span>
              <Sparkles className="w-5 h-5" />
            </div>
            {isVipPass ? (
              <div>
                <div className="text-xl font-bold text-amber-300">ACTIVE VIP MEMBER</div>
                <p className="text-xs text-slate-400 mt-1">
                  Valid until {new Date(vipPassExpiresAt).toLocaleDateString()}
                </p>
                <span className="inline-block mt-3 text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-semibold">
                  0% Booking Fees Enabled
                </span>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-black text-white">₹199 / month</div>
                <p className="text-xs text-slate-400 mt-1">
                  0% platform service fee on all rides for 30 days.
                </p>
                <button
                  onClick={handleSubscribeVip}
                  disabled={vipLoading}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  {vipLoading ? 'Activating...' : 'Activate Pass Now'}
                </button>
              </div>
            )}
          </div>

          {/* Admin Platform Revenue (Visible to Admins) */}
          {adminStats && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between text-emerald-400 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Earnings</span>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                ₹{adminStats.totalPlatformCommission}
              </div>
              <div className="text-xs text-slate-400 mt-2 space-y-1">
                <div>Total Volume: ₹{adminStats.totalTransactionVolume}</div>
                <div>Completed Rides: {adminStats.totalPaidTransactions}</div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Recent Transactions
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} Records</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No transactions recorded yet. Complete a ride booking to see your ledger here!
            </div>
          ) : (
            <div className="divide-y divide-slate-800 overflow-x-auto">
              {transactions.map((txn) => {
                const isDebit = txn.type === 'ride_payment' || txn.type === 'vip_subscription';
                return (
                  <div key={txn._id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isDebit ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{txn.description}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{new Date(txn.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            {txn.paymentGateway}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-base font-bold ${isDebit ? 'text-slate-200' : 'text-emerald-400'}`}>
                        {isDebit ? `-₹${txn.amount}` : `+₹${txn.amount}`}
                      </div>
                      {txn.platformFee > 0 && (
                        <div className="text-[11px] text-indigo-400">
                          (Includes ₹{txn.platformFee} platform fee)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
