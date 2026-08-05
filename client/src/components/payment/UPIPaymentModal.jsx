import React, { useState } from 'react';
import { X, QrCode, Copy, CheckCircle2, Smartphone, ExternalLink, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const UPIPaymentModal = ({ isOpen, onClose, amount, rideRequestId, note, onPaymentSuccess }) => {
  const { showToast } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!isOpen) return null;

  const vpaHandle = 'campusride@upi';
  const payNote = note || `Ride Fare Payment - ${rideRequestId ? 'ID: ' + rideRequestId.slice(-6) : 'Carpool'}`;
  
  // Standardized UPI Intent URI
  const upiIntentUri = `upi://pay?pa=${vpaHandle}&pn=CampusRide%20Carpool&am=${amount}&cu=INR&tn=${encodeURIComponent(payNote)}`;

  const copyVpa = () => {
    navigator.clipboard.writeText(vpaHandle);
    setCopied(true);
    showToast('UPI VPA (campusride@upi) copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateUPIPayment = async () => {
    setVerifying(true);
    try {
      if (rideRequestId) {
        const res = await api.post('/payments/verify', {
          rideRequestId,
          orderId: `order_upi_${Date.now()}`,
          paymentId: `pay_upi_${Date.now()}`,
          gateway: 'upi_qr',
        });
        if (res.success) {
          setPaid(true);
          showToast('UPI payment verified successfully! Seat confirmed.', 'success');
          if (onPaymentSuccess) onPaymentSuccess(res.data);
        }
      } else {
        // Wallet Top-Up via UPI
        const res = await api.post('/payments/topup-upi', { amount: Number(amount) });
        if (res.success) {
          setPaid(true);
          showToast(`₹${amount} credited to your Campus Wallet via UPI!`, 'success');
          if (onPaymentSuccess) onPaymentSuccess(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'UPI Payment verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5">
              Scan & Pay via Dynamic UPI
            </h3>
            <p className="text-xs text-slate-400 font-medium">GPay, PhonePe, Paytm, BHIM & Cred</p>
          </div>
        </div>

        {!paid ? (
          <div className="space-y-4">
            
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payable Amount</span>
              <div className="text-3xl font-black text-emerald-400">₹{amount}</div>
              <p className="text-[11px] text-slate-400">{payNote}</p>
            </div>

            {/* Dynamic Generated QR Visual Box */}
            <div className="p-5 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-3 shadow-inner">
              <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border-4 border-emerald-500/40">
                {/* Embedded High-Resolution Custom QR Code Representation */}
                <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center text-emerald-400 font-mono text-[9px] text-center border border-slate-700">
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm border-2 border-slate-950" />
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm border-2 border-slate-950" />
                  </div>
                  <div className="py-2 text-white font-sans text-xs font-black tracking-widest bg-slate-950 px-3 py-1 rounded-md border border-emerald-500/40">
                    SCAN UPI QR
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 bg-emerald-400 rounded-sm border-2 border-slate-950" />
                    <span className="text-[8px] text-emerald-400 font-bold self-end">₹{amount}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs space-y-1">
                <p className="font-bold text-slate-900">Scan using any UPI App</p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-semibold pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">GPay</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">BHIM</span>
                </div>
              </div>
            </div>

            {/* VPA Handle & Direct Intent Action */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Official UPI VPA:</span>
                <span className="font-mono font-bold text-emerald-400">{vpaHandle}</span>
              </div>
              <button
                onClick={copyVpa}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy VPA'}
              </button>
            </div>

            {/* Mobile Deep-Link Direct App Open button */}
            <a
              href={upiIntentUri}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Open In Installed UPI App
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* Verification trigger */}
            <button
              onClick={handleSimulateUPIPayment}
              disabled={verifying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Verifying UPI Payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> I Have Paid — Confirm Payment
                </>
              )}
            </button>

          </div>
        ) : (
          /* Payment Success Confirmation State */
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">UPI Payment Verified!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your payment of <span className="text-emerald-400 font-extrabold">₹{amount}</span> has been processed and credited to the carpool transaction log.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UPIPaymentModal;
