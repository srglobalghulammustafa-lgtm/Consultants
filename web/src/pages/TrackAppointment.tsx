import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, Video, CheckCircle2, AlertCircle, MessageCircle, ArrowRight, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import { useSiteSettings } from '../context/SettingsContext';
import { COMPANY_CONTACT } from '../data/mockData';
import { Appointment } from '../types';

export const TrackAppointment: React.FC = () => {
  const location = useLocation();
  const { getAppointmentByCodeOrPhone, refreshData } = useLiveData();
  const { settings } = useSiteSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Appointment | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id') || params.get('code') || params.get('phone');
    if (idParam) {
      setSearchQuery(idParam);
      const found = getAppointmentByCodeOrPhone(idParam);
      setResult(found);
      setSearched(true);
    }
  }, [location, getAppointmentByCodeOrPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = getAppointmentByCodeOrPhone(searchQuery);
    setResult(found);
    setSearched(true);
  };

  const whatsappPhone = settings.whatsapp?.phone || COMPANY_CONTACT.whatsappNumber || '923278321560';

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">
            Real-Time Status Tracker
          </span>
          <h1 className="text-4xl font-black text-navy-950 font-serif">Track Appointment Status</h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Enter your 4-digit unique Appointment Reference ID (e.g., <strong>SRG-APT-8492</strong>) or registered phone number to check your live slot status.
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter SRG-APT-XXXX or Phone (+923001234567)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold tracking-wide"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <span>Search Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {searched && (
          <div>
            {result ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-fade-in">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Appointment Reference Code
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-mono font-black text-navy-950 mt-0.5">
                      {result.appointment_code || `SRG-APT-${result.id.slice(0, 4)}`}
                    </h2>
                  </div>

                  {/* Dynamic Status Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : result.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : result.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {result.status === 'Confirmed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>● Confirmed (Slot Locked)</span>
                        </>
                      ) : result.status === 'Completed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span>● Session Completed</span>
                        </>
                      ) : result.status === 'Cancelled' ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>● Booking Cancelled</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>● Pending Fee Verification</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Verification Instruction Note if Pending */}
                {result.status === 'Pending' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Action Required to Lock Slot</span>
                    </div>
                    <p className="leading-relaxed text-amber-800/90">
                      Your appointment slot is currently reserved. Please send your fee payment receipt along with your Reference Code (<strong>{result.appointment_code || 'SRG-APT-XXXX'}</strong>) to our official WhatsApp helpline below.
                    </p>
                  </div>
                )}

                {/* Progress Steps Timeline */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Booking Progress Timeline
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <div>
                        <div className="font-bold text-slate-800">Slot Reserved</div>
                        <div className="text-[10px] text-slate-500">Form Submitted</div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      result.status === 'Confirmed' || result.status === 'Completed'
                        ? 'bg-white border-emerald-300'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <span className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        result.status === 'Confirmed' || result.status === 'Completed'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>2</span>
                      <div>
                        <div className="font-bold text-slate-800">Fee Verification</div>
                        <div className="text-[10px] text-slate-500">
                          {result.status === 'Confirmed' || result.status === 'Completed' ? 'Verified & Approved' : 'Send via WhatsApp'}
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      result.status === 'Completed' ? 'bg-white border-blue-300' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <span className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        result.status === 'Completed' ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-600'
                      }`}>3</span>
                      <div>
                        <div className="font-bold text-slate-800">Counseling Session</div>
                        <div className="text-[10px] text-slate-500">
                          {result.status === 'Completed' ? 'Completed' : 'Scheduled'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Information Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Client Name</div>
                    <div className="font-bold text-navy-950 text-sm">{result.client_name}</div>
                    <div className="text-slate-500">{result.email} • {result.phone}</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Scheduled Date & Time</div>
                    <div className="font-bold text-brand-600 text-sm">{result.appointment_date}</div>
                    <div className="text-slate-700 font-medium">{result.time_slot} ({result.mode} Format)</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Target Destination</div>
                    <div className="font-bold text-navy-950 text-sm">{result.destination}</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Office Location / Link</div>
                    <div className="font-bold text-navy-950 text-sm">
                      {result.mode === 'Office' ? '1st Floor, 239A Civic Center, Gujranwala' : 'Online Video Link (Shared on WhatsApp)'}
                    </div>
                  </div>
                </div>

                {/* Direct Action WhatsApp Button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello SR Global Consultants! My Appointment Reference ID is ${result.appointment_code || result.id}. I am checking the status of my appointment booked for ${result.appointment_date} at ${result.time_slot}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Chat with Counselor on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => refreshData()}
                    className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950">No Appointment Found</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    No matching booking found for "<strong>{searchQuery}</strong>". Please check your Reference Code or try your phone number.
                  </p>
                </div>
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book New Appointment</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
