import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { fetchUserLocationWithQuota } from '../lib/ipstack';

export const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Consultation Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let locationData = null;
      try {
        locationData = await fetchUserLocationWithQuota();
      } catch (locErr) {
        console.warn('Geolocation capture skipped:', locErr);
      }

      await supabase.from('leads').insert([
        {
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          destination: 'General',
          course_interest: form.subject,
          notes: form.message,
          source: 'Website Contact Page',
          city: locationData?.city || undefined,
          region_name: locationData?.region_name || undefined,
          country_name: locationData?.country_name || undefined,
          ip_address: locationData?.ip || undefined,
          latitude: locationData?.latitude || undefined,
          longitude: locationData?.longitude || undefined,
          location_data: locationData || undefined
        }
      ]);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: 'General Consultation Inquiry', message: '' });
    } catch (err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Get In Touch</span>
          <h1 className="text-4xl font-black text-navy-950 mt-3 font-serif">Contact SR Global Consultants</h1>
          <p className="text-slate-600 mt-3 text-base">
            Reach out directly to our central Gujranwala office or contact our Australian liaison branch for urgent migration guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information & Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-2xl font-bold text-navy-950">Head Office Details</h3>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800">Gujranwala Office</strong>
                    <span className="text-slate-600 leading-relaxed">{COMPANY_CONTACT.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800">Pakistan Helpline</strong>
                    <a href={`tel:${COMPANY_CONTACT.phonePakistan}`} className="text-brand-600 font-semibold hover:underline">
                      {COMPANY_CONTACT.phonePakistan}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800">Australia Office Contact</strong>
                    <a href={`tel:${COMPANY_CONTACT.phoneAustralia}`} className="text-brand-600 font-semibold hover:underline">
                      {COMPANY_CONTACT.phoneAustralia}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800">Official Admissions Email</strong>
                    <a href={`mailto:${COMPANY_CONTACT.email}`} className="text-slate-600 hover:text-brand-600">
                      {COMPANY_CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-800">Counseling Hours</strong>
                    <span className="text-slate-600">{COMPANY_CONTACT.officeHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <a
                  href={`https://wa.me/${COMPANY_CONTACT.whatsappNumber}?text=Hello%20SR%20Global,%20I%20am%20contacting%20you%20via%20your%20website.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-navy-950 mb-2">Send an Official Message</h3>
              <p className="text-sm text-slate-500 mb-6">Our senior counseling team responds to all formal correspondence within 24 hours.</p>

              {submitted ? (
                <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-200 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                  <h4 className="text-xl font-bold text-green-800">Message Delivered</h4>
                  <p className="text-sm text-green-700 max-w-md mx-auto">
                    Thank you for reaching out to SR Global Consultants. An education advisor will reply to your provided email and WhatsApp.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-bold text-brand-600 hover:underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="e.g. Asad Raza"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="+92 300 0000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="asad@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Message / Inquiry *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Detail your academic background, intended destination, and any specific questions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Transmitting Message...' : 'Submit Message to Counselors'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Full Width Google Maps Embed */}
        <div className="mt-14 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <iframe
            title="SR Global Consultants Gujranwala Map Location"
            src={`https://maps.google.com/maps?q=${COMPANY_CONTACT.latitude},${COMPANY_CONTACT.longitude}&hl=en&z=16&output=embed`}
            width="100%"
            height="400"
            className="w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
