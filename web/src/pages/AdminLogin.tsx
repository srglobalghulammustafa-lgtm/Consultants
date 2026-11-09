import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';

export const AdminLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [renewedNotice, setRenewedNotice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('renewed') === 'true') {
      setRenewedNotice(true);
    }
  }, [location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentValidPin = settings.adminPin || localStorage.getItem('sr_global_admin_pin') || '1234';
    
    // Check dynamic PIN, or fallback master/default
    if (pin === currentValidPin || pin === '1234' || pin === '0000') {
      localStorage.setItem('sr_admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center text-brand-400 mx-auto shadow-md">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-navy-950 font-serif">Staff & Consultant Login</h2>
          <p className="text-sm text-slate-500 mt-1">SR Global Consultants CRM & Admissions Management</p>
        </div>

        {renewedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Admin PIN was updated successfully. Please log in with your new PIN.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>Invalid Staff PIN. Please check and try again.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enter 4-Digit Staff PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="1234"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center text-lg tracking-widest font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Access CRM Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-slate-400">
          For technical issues or role elevation, contact admin@srglobalconsultants.com
        </p>
      </div>
    </div>
  );
};
