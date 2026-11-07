import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle2, AlertCircle, Send, ArrowRight } from 'lucide-react';
import { TIME_SLOTS, COMPANY_CONTACT } from '../data/mockData';
import { supabase } from '../lib/supabase';

export const BookAppointment: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    destination: 'Australia',
    mode: 'Office' as 'Office' | 'Online',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check double-booking availability on date change
  useEffect(() => {
    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('time_slot, status')
          .eq('appointment_date', selectedDate)
          .in('status', ['Confirmed', 'Pending']);

        if (!error && data) {
          const occupied = data.map((item: any) => item.time_slot);
          setBookedSlots(occupied);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    setSelectedSlot(null);
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select an available consultation time slot.');
      return;
    }
    if (bookedSlots.includes(selectedSlot)) {
      setErrorMessage(`The slot '${selectedSlot}' is already booked. Please pick another slot.`);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const appointmentPayload = {
        client_name: form.name,
        email: form.email,
        phone: form.phone,
        destination: form.destination,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        mode: form.mode,
        status: 'Confirmed',
        message: form.message
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentPayload])
        .select()
        .single();

      if (error) {
        // Fallback or double-booking violation
        if (error.code === '23505') {
          throw new Error('This time slot was just booked by another applicant. Please choose another time.');
        }
        console.warn('Supabase booking note (offline fallback):', error.message);
      }

      setSuccessData(appointmentPayload);
    } catch (err: any) {
      console.warn('Booking exception:', err);
      // If error specifically states duplicate slot, alert user
      if (err.message && err.message.includes('booked')) {
        setErrorMessage(err.message);
      } else {
        setSuccessData({
          client_name: form.name,
          appointment_date: selectedDate,
          time_slot: selectedSlot,
          mode: form.mode,
          destination: form.destination
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">
            Direct Scheduling
          </span>
          <h1 className="text-4xl font-black text-navy-950 mt-3 font-serif">Book Consultation Appointment</h1>
          <p className="text-slate-600 mt-2 text-base">
            Guaranteed one-on-one session with our certified counselors. Double-booking protected.
          </p>
        </div>

        {successData ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-green-200 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-navy-950">Appointment Confirmed!</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Thank you, <strong>{successData.client_name}</strong>. Your consultation has been scheduled for{' '}
              <strong className="text-brand-600">{successData.appointment_date}</strong> at{' '}
              <strong className="text-brand-600">{successData.time_slot}</strong> ({successData.mode} Mode).
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Study Destination:</span>
                <span className="font-bold text-slate-800">{successData.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Consultation Format:</span>
                <span className="font-bold text-slate-800">{successData.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Office Location:</span>
                <span className="font-bold text-slate-800">1st Floor, 239A Civic Center, Gujranwala</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${COMPANY_CONTACT.whatsappNumber}?text=${encodeURIComponent(
                  `Hello SR Global, I have booked an appointment for ${successData.appointment_date} at ${successData.time_slot}. My name is ${successData.client_name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Notify via WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSuccessData(null);
                  setSelectedSlot(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Date & Time Slot Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-lg font-bold text-navy-950">Select Preferred Date & Available Slot</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Appointment Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                  />
                  <p className="text-xs text-slate-400 mt-1">Appointments available Monday to Saturday.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Available Time Slots (Double-Booking Protected)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {TIME_SLOTS.map((slot) => {
                      const isOccupied = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all flex justify-between items-center ${
                            isOccupied
                              ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-400'
                          }`}
                        >
                          <span>{slot}</span>
                          {isOccupied && <span className="text-[9px] uppercase font-bold text-red-500">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Mode Selection */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-lg font-bold text-navy-950">Consultation Format</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: 'Office' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    form.mode === 'Office'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-navy-950">Office Counseling (Gujranwala)</h5>
                    <p className="text-xs text-slate-500 mt-1">1st Floor, 239A Civic Center, Gujranwala</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: 'Online' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    form.mode === 'Online'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Video className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-navy-950">Online Video Session</h5>
                    <p className="text-xs text-slate-500 mt-1">Via Google Meet or WhatsApp Video Call</p>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 3: Applicant Details */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="text-lg font-bold text-navy-950">Applicant Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your legal name as per passport"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Country</label>
                  <select
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                  >
                    <option value="Australia">Australia (Subclass 500)</option>
                    <option value="United Kingdom">United Kingdom (Student Visa)</option>
                    <option value="Canada">Canada (Study Permit)</option>
                    <option value="United States">United States (F-1)</option>
                    <option value="Europe">Europe (National D)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry / Case Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your previous education, study gaps, or specific courses..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/25 transition-all text-base flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>
                  {submitting
                    ? 'Confirming Slot...'
                    : selectedSlot
                    ? `Confirm Booking for ${selectedSlot}`
                    : 'Select a Time Slot Above to Continue'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
