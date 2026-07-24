import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Car, Plus, ShieldCheck } from 'lucide-react';

const VehicleManagementPage = () => {
  const { showToast } = useNotifications();
  const [vehicles, setVehicles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    vehicleType: 'Car',
    model: '',
    registrationNumber: '',
    capacity: 4,
    color: 'Silver',
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vehicles', newVehicle);
      if (res.success) {
        showToast('Vehicle registered successfully!', 'success');
        setShowAddModal(false);
        fetchVehicles();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add vehicle', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Vehicle Garage</h1>
            <p className="text-xs text-slate-400">Register your personal vehicles for campus rides.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-400"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{v.model}</h4>
                    <span className="text-xs text-slate-400">{v.color} • {v.vehicleType}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="pt-2 flex justify-between text-xs border-t border-slate-800/80">
                <span className="text-slate-400">Plate Number</span>
                <span className="font-mono font-bold text-white">{v.registrationNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Capacity</span>
                <span className="font-bold text-teal-400">{v.capacity} Passengers</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Register New Vehicle</h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Model Name</label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    placeholder="e.g. Honda City i-VTEC"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Registration Number</label>
                  <input
                    type="text"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                    placeholder="CH-01-AB-4890"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Passenger Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                  >
                    Save Vehicle
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

export default VehicleManagementPage;
