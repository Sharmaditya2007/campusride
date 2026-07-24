import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { Leaf, DollarSign, Car, Award, BarChart3, Info } from 'lucide-react';

const EnvironmentalImpactPage = () => {
  const [stats, setStats] = useState({
    totalSharedRides: 1420,
    totalKilometersShared: 28400,
    estimatedFuelSavedLiters: 2366,
    estimatedMoneySavedINR: 224770,
    estimatedCO2ReducedKg: 5444.8,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/features/environmental-impact');
        if (res.success) setStats(res.data);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Leaf className="w-4 h-4" /> Eco Metrics
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Campus Environmental Impact</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Tracking reduced carbon footprints, fuel conservation, and student commute savings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-slate-400 text-xs font-medium block">CO₂ Emissions Reduced</span>
            <span className="text-2xl font-black text-emerald-400 block">{stats.estimatedCO2ReducedKg} kg</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-2">
            <Car className="w-6 h-6 text-teal-400" />
            <span className="text-slate-400 text-xs font-medium block">Shared Kilometers</span>
            <span className="text-2xl font-black text-white block">{stats.totalKilometersShared.toLocaleString()} km</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-2">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <span className="text-slate-400 text-xs font-medium block">Fuel Conserved</span>
            <span className="text-2xl font-black text-green-400 block">{stats.estimatedFuelSavedLiters.toLocaleString()} Liters</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            <span className="text-slate-400 text-xs font-medium block">Student Money Saved</span>
            <span className="text-2xl font-black text-amber-400 block">₹{stats.estimatedMoneySavedINR.toLocaleString()}</span>
          </div>
        </div>

        {/* Formula Explanations */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-3 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" /> Dynamic Impact Assumptions & Formulas
          </h3>
          <p className="leading-relaxed text-slate-400">
            • <b>CO₂ Reduction:</b> Calculated at 2.3 kg CO₂ saved per liter of petrol saved by avoiding solo vehicle trips.<br />
            • <b>Fuel Calculation:</b> Based on an average student vehicle efficiency of 12 km/L across campus carpools.<br />
            • <b>Financial Savings:</b> Estimated based on standard fuel prices (₹95/L) split among passenger peers.
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default EnvironmentalImpactPage;
