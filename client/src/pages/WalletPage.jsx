import React, { useState, useEffect } from 'react';
import { Wallet, Crown, ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, QrCode, FileText } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import UPIPaymentModal from '../components/payment/UPIPaymentModal';
import FareReceiptModal from '../components/payment/FareReceiptModal';
import { useNotifications } from '../context/NotificationContext';

const WalletPage = () => {
  const { showToast } = useNotifications();
  const [walletData, setWalletData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vipLoading, setVipLoading] = useState(false);
  
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(200);
  
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/wallet');
      if (res.success) {
        setWalletData(res.data);
      }

      // Check if admin to fetch platform revenue
      const user = JSON.parse(localStorage.getItem('campusride_user') || '{}');
      if (user.role === 'admin') {
        const adminRes = await api.get('/payments/admin/platform-earnings');
        if (adminRes.success) {
          setAdminStats(adminRes.data);
        }
      }
    } catch (err) {
      console.warn('[Wallet] Load error:', err.message);
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
      const res = await api.post('/payments/subscribe-vip');
      if (res.success) {
        showToast('⭐ CampusRide VIP Pass activated! 0% booking fees enabled.', 'success');
        fetchWallet();
      }
    } catch (err) {
      showToast(err.message || 'Failed to activate VIP Pass.', 'error');
    } finally {
      setVipLoading(false);
    }
  };

  const handleTopUpSuccess = (data) => {
    fetchWallet();
  };

  const openReceipt = (txn) => {
    setSelectedReceipt(txn);
    setReceiptModalOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="font-semibold text-sm">Loading Campus Wallet...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { walletBalance = 0, isVipPass = false, vipPassExpiresAt, transactions = [] } = walletData || {};

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Campus Wallet & Earnings</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage instant ride payments, driver earnings, and dynamic UPI QR top-ups.
            </p>
          </div>
          <button
            onClick={fetchWallet}
            className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-2 rounded-xl text-slate-300 transition w-max shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Balance
          </button>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Balance Card with UPI QR Top-Up */}
          <div className="glass-card border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-4xl font-black text-white">₹{walletBalance}</div>
              <p className="text-xs text-slate-400 mt-1">
                Usable for instant seat bookings and driver payouts.
              </p>
            </div>

            <button
              onClick={() => setUpiModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-4 h-4" /> Top Up via UPI QR
            </button>
          </div>

          {/* VIP Pass Card */}
          <div className="glass-card border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-amber-400">
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
                  0% Booking Fees Active
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
                  className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  {vipLoading ? 'Activating...' : 'Activate Pass Now'}
                </button>
              </div>
            )}
          </div>

          {/* Admin Platform Revenue (Visible to Admins) */}
          {adminStats && (
            <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Earnings</span>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-indigo-300">
                ₹{adminStats.totalPlatformCommission}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Total Volume: ₹{adminStats.totalTransactionVolume}</div>
                <div>Completed Rides: {adminStats.totalPaidTransactions}</div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="glass-card border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-0">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Transaction Ledger
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} Records</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No transaction history found. Book a ride or scan UPI QR to add funds!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 overflow-x-auto">
              {transactions.map((txn) => {
                const isDebit = txn.type === 'ride_payment' || txn.type === 'vip_subscription';
                return (
                  <div
                    key={txn._id}
                    onClick={() => openReceipt(txn)}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDebit ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{txn.description}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{new Date(txn.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] bg-slate-950 px-2 py-0.5 rounded text-emerald-400 font-mono">
                            {txn.paymentGateway}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className={`font-bold text-sm ${isDebit ? 'text-slate-200' : 'text-emerald-400'}`}>
                          {isDebit ? `-₹${txn.amount}` : `+₹${txn.amount}`}
                        </div>
                        {txn.platformFee > 0 && (
                          <div className="text-[10px] text-indigo-400">
                            (Fee: ₹{txn.platformFee})
                          </div>
                        )}
                      </div>
                      <FileText className="w-4 h-4 text-slate-500 hover:text-emerald-400 transition" title="View Digital Receipt" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UPI QR Modal */}
        <UPIPaymentModal
          isOpen={upiModalOpen}
          onClose={() => setUpiModalOpen(false)}
          amount={topUpAmount}
          note="Campus Wallet UPI Top-Up"
          onPaymentSuccess={handleTopUpSuccess}
        />

        {/* Fare Receipt Modal */}
        <FareReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          transaction={selectedReceipt}
        />

      </div>
    </MainLayout>
  );
};

export default WalletPage;
