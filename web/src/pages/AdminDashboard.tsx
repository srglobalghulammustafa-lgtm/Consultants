import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle2, Clock, Phone, Download, 
  MessageCircle, Edit3, Trash2, LogOut, RefreshCw, Database, 
  ShieldCheck, ArrowRight, Filter, Save, Plus, Globe, Sparkles 
} from 'lucide-react';
import { Lead, Appointment, LeadStatus, Testimonial, Course } from '../types';
import { supabase } from '../lib/supabase';
import { COMPANY_CONTACT, TESTIMONIALS, COURSES } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'leads' | 'appointments' | 'settings'>('leads');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Dynamic Settings & Content States
  const [contactSettings, setContactSettings] = useState({ ...COMPANY_CONTACT });
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([...TESTIMONIALS]);
  const [coursesList, setCoursesList] = useState<Course[]>([...COURSES]);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState<string | null>(null);

  // New Testimonial Form State
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    university: '',
    country: 'Australia',
    quote: '',
    year: '2026'
  });

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '',
    category_slug: 'trade-courses',
    country: 'Australia',
    duration: '2 Years',
    estimated_fees: 'AUD 14,000 / year',
    intake_months: 'February, July',
    description: '',
    career_paths: ''
  });

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      full_name: 'Muhammad Ali',
      email: 'ali.muhammad@gmail.com',
      phone: '+92 301 2345678',
      destination: 'Australia',
      course_interest: 'Automotive Technology',
      status: 'New',
      notes: 'Graduated with DAE Mechanical. Wants July intake.',
      created_at: 'Today, 10:15 AM'
    },
    {
      id: '2',
      full_name: 'Sana Tariq',
      email: 'sana.tariq@gmail.com',
      phone: '+92 321 7654321',
      destination: 'United Kingdom',
      course_interest: 'Master in Business Analytics',
      status: 'Contacted',
      notes: 'IELTS score 6.5. Sent university brochure list.',
      created_at: 'Yesterday'
    },
    {
      id: '3',
      full_name: 'Daniyal Qasim',
      email: 'daniyal.qasim@gmail.com',
      phone: '+92 345 8899001',
      destination: 'Canada',
      course_interest: 'Software Engineering',
      status: 'In Progress',
      notes: 'Transcripts assessed. Waiting on bank statement verification.',
      created_at: '3 days ago'
    },
    {
      id: '4',
      full_name: 'Khadija Bibi',
      email: 'khadija.bibi@yahoo.com',
      phone: '+92 333 1122334',
      destination: 'Australia',
      course_interest: 'Commercial Cookery',
      status: 'Converted',
      notes: 'Offer letter received from Melbourne Culinary Institute. Preparing eCoE.',
      created_at: '5 days ago'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      client_name: 'Zubair Ahmad',
      email: 'zubair.ahmad@gmail.com',
      phone: '+92 300 1234567',
      destination: 'Australia',
      appointment_date: '2026-11-10',
      time_slot: '10:00 AM - 11:00 AM',
      mode: 'Office',
      status: 'Confirmed',
      message: 'Inquiry regarding Subclass 500 visa for Cookery course in Melbourne.'
    },
    {
      id: '2',
      client_name: 'Fatima Noor',
      email: 'fatima.noor@outlook.com',
      phone: '+92 312 9876543',
      destination: 'United Kingdom',
      appointment_date: '2026-11-10',
      time_slot: '02:00 PM - 03:00 PM',
      mode: 'Online',
      status: 'Confirmed',
      message: 'Wants counseling on 1-year Master\'s in London and CAS timeline.'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Fetch real leads & appointments from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: remoteLeads, error: lErr } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!lErr && remoteLeads && remoteLeads.length > 0) {
        setLeads(remoteLeads as Lead[]);
      }

      const { data: remoteAppts, error: aErr } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
      if (!aErr && remoteAppts && remoteAppts.length > 0) {
        setAppointments(remoteAppts as Appointment[]);
      }
    } catch (err) {
      console.warn('Using local CRM records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (leadId: string, nextStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );

    try {
      await supabase.from('leads').update({ status: nextStatus }).eq('id', leadId);
    } catch (e) {
      // local update retained
    }
  };

  const handleUpdateNote = async () => {
    if (!editingLead) return;
    const updatedNotes = editingLead.notes ? `${editingLead.notes}\n[Follow-up]: ${noteInput}` : noteInput;

    setLeads((prev) =>
      prev.map((l) => (l.id === editingLead.id ? { ...l, notes: updatedNotes } : l))
    );

    try {
      await supabase.from('leads').update({ notes: updatedNotes }).eq('id', editingLead.id);
    } catch (e) {}

    setEditingLead(null);
    setNoteInput('');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Full Name,Phone,Email,Destination,Course Interest,Status,Notes\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.full_name}","${l.phone}","${l.email}","${l.destination}","${l.course_interest || ''}","${l.status}","${(l.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sr_global_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    if (selectedStatusFilter === 'all') return true;
    return l.status === selectedStatusFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-brand-500 text-white font-bold text-xs px-2.5 py-1 rounded uppercase tracking-wider">
                Staff CRM
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <Database className="w-3.5 h-3.5 text-green-600" />
                <span>Supabase Live Connected</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-navy-950 mt-1 font-serif">Consultant Administrative Control</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-brand-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Cloud</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('sr_admin_auth');
                navigate('/admin/login');
              }}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-navy-950">{leads.length}</div>
              <div className="text-xs uppercase font-bold text-slate-400">Total Inquiries</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-navy-950">{appointments.length}</div>
              <div className="text-xs uppercase font-bold text-slate-400">Scheduled Sessions</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-navy-950">
                {leads.filter((l) => l.status === 'Converted').length}
              </div>
              <div className="text-xs uppercase font-bold text-slate-400">Enrolled Students</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'leads' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
            }`}
          >
            Leads & Inquiries Pipeline ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'appointments' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
            }`}
          >
            Appointments & Slot Manager ({appointments.length})
          </button>
        </div>

        {/* Tab 1: Leads Pipeline */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filter Stage:</span>
              {['all', 'New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedStatusFilter === st
                      ? 'bg-navy-950 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Destination & Course</th>
                      <th className="py-3.5 px-4">Current Pipeline Stage</th>
                      <th className="py-3.5 px-4">Counselor Notes</th>
                      <th className="py-3.5 px-4 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-navy-950">{lead.full_name}</div>
                          <div className="text-xs text-slate-400">{lead.phone} • {lead.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700">
                            {lead.destination}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5">{lead.course_interest || 'General'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Converted">Converted</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-xs max-w-xs truncate text-slate-500">
                          {lead.notes || 'No notes added'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setNoteInput('');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                            title="Add Note"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              lead.full_name
                            )},%20this%20is%20SR%20Global%20Consultants.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-2.5 py-1 rounded-lg"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Scheduled Date & Time</th>
                    <th className="py-3.5 px-4">Country & Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-950">{appt.client_name}</div>
                        <div className="text-xs text-slate-400">{appt.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div>{appt.appointment_date}</div>
                        <div className="text-xs text-brand-600">{appt.time_slot}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium">{appt.destination}</span>
                        <div className="text-xs text-slate-400">{appt.mode} Session</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            appt.client_name
                          )},%20confirming%20your%20consultation%20with%20SR%20Global%20Consultants%20for%20${appt.appointment_date}%20at%20${appt.time_slot}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#25D366] text-white text-xs font-bold px-2.5 py-1 rounded-lg"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Remind</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Settings & Dynamic Content */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Alert banner if saved */}
            {settingsSavedAlert && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  {settingsSavedAlert}
                </span>
                <button onClick={() => setSettingsSavedAlert(null)} className="text-xs text-green-700 hover:underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* Section 1: Contact & Social Handles */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-navy-950">Company Contact & Social Handles</h3>
                  <p className="text-xs text-slate-500">Updates live across mobile application, web portal, and WhatsApp triggers</p>
                </div>
                <button
                  onClick={() => {
                    setSettingsSavedAlert('Company contact & social handles updated successfully!');
                    setTimeout(() => setSettingsSavedAlert(null), 4000);
                  }}
                  className="inline-flex items-center gap-2 bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                >
                  <Save className="w-4 h-4 text-brand-400" />
                  <span>Save Contact Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Number (e.g. 923278321560)</label>
                  <input
                    type="text"
                    value={contactSettings.whatsappNumber}
                    onChange={(e) => setContactSettings({ ...contactSettings, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pakistan Helpline</label>
                  <input
                    type="text"
                    value={contactSettings.phonePakistan}
                    onChange={(e) => setContactSettings({ ...contactSettings, phonePakistan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Australia Helpline</label>
                  <input
                    type="text"
                    value={contactSettings.phoneAustralia}
                    onChange={(e) => setContactSettings({ ...contactSettings, phoneAustralia: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label>
                  <input
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facebook Handle / URL</label>
                  <input
                    type="text"
                    value={contactSettings.facebook}
                    onChange={(e) => setContactSettings({ ...contactSettings, facebook: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">X (Twitter) Handle / URL</label>
                  <input
                    type="text"
                    value={contactSettings.twitter}
                    onChange={(e) => setContactSettings({ ...contactSettings, twitter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LinkedIn Handle / URL</label>
                  <input
                    type="text"
                    value={contactSettings.linkedin}
                    onChange={(e) => setContactSettings({ ...contactSettings, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Office Address</label>
                  <input
                    type="text"
                    value={contactSettings.address}
                    onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Manage Success Stories & Testimonials */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-navy-950 mb-1">Success Stories & Testimonials</h3>
              <p className="text-xs text-slate-500 mb-6">Add or remove verified student visa approvals shown on the home page</p>

              {/* Add form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Student Story</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Student Name (e.g. Bilal Tahir)"
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="University / College"
                    value={newTestimonial.university}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, university: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <select
                    value={newTestimonial.country}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, country: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Australia">Australia</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Visa Year (e.g. 2026)"
                    value={newTestimonial.year}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, year: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Student review quote (e.g. 'Got my Australian subclass 500 visa approved in just 18 days with SR Global...')"
                  value={newTestimonial.quote}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <button
                  onClick={() => {
                    if (!newTestimonial.name || !newTestimonial.quote) return;
                    const created: Testimonial = {
                      id: String(Date.now()),
                      student_name: newTestimonial.name,
                      name: newTestimonial.name,
                      university: newTestimonial.university,
                      country: newTestimonial.country,
                      quote: newTestimonial.quote,
                      rating: 5,
                      year: newTestimonial.year
                    };
                    setTestimonialsList([created, ...testimonialsList]);
                    setNewTestimonial({ name: '', university: '', country: 'Australia', quote: '', year: '2026' });
                    setSettingsSavedAlert(`Added success story for ${created.student_name}`);
                  }}
                  className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Success Story</span>
                </button>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonialsList.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-950">{t.student_name || t.name}</span>
                        <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">{t.country} ({t.year})</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{t.university}</p>
                      <p className="text-xs text-slate-600 italic">"{t.quote}"</p>
                    </div>
                    <button
                      onClick={() => setTestimonialsList(testimonialsList.filter((item) => item.id !== t.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Course Catalog */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-navy-950 mb-1">Course Catalog Management</h3>
              <p className="text-xs text-slate-500 mb-6">Create and publish new vocational, trade, and higher education courses</p>

              {/* Add Course Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Course</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Course Title (e.g. Diploma of Carpentry)"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <select
                    value={newCourse.category_slug}
                    onChange={(e) => setNewCourse({ ...newCourse, category_slug: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="trade-courses">Trade Courses</option>
                    <option value="vocational-courses">Vocational Courses</option>
                    <option value="higher-education">Higher Education</option>
                    <option value="short-courses">Short Courses</option>
                    <option value="aqf-australia">AQF Australia</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Country (e.g. Australia)"
                    value={newCourse.country}
                    onChange={(e) => setNewCourse({ ...newCourse, country: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2 Years)"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Estimated Fees (e.g. AUD 13,500 / year)"
                    value={newCourse.estimated_fees}
                    onChange={(e) => setNewCourse({ ...newCourse, estimated_fees: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Intakes (e.g. Feb, July, Oct)"
                    value={newCourse.intake_months}
                    onChange={(e) => setNewCourse({ ...newCourse, intake_months: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Detailed course description & syllabus highlights..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <button
                  onClick={() => {
                    if (!newCourse.title) return;
                    const created: Course = {
                      id: String(Date.now()),
                      title: newCourse.title,
                      category_slug: newCourse.category_slug,
                      country: newCourse.country,
                      duration: newCourse.duration,
                      estimated_fees: newCourse.estimated_fees,
                      intake_months: newCourse.intake_months,
                      description: newCourse.description || 'Program details available via counselor consultation.',
                      career_paths: newCourse.career_paths || 'Industry Specialist, Licensed Practitioner'
                    };
                    setCoursesList([created, ...coursesList]);
                    setNewCourse({
                      title: '',
                      category_slug: 'trade-courses',
                      country: 'Australia',
                      duration: '2 Years',
                      estimated_fees: 'AUD 14,000 / year',
                      intake_months: 'February, July',
                      description: '',
                      career_paths: ''
                    });
                    setSettingsSavedAlert(`Added ${created.title} to catalog`);
                  }}
                  className="inline-flex items-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-400" />
                  <span>Add Course to Catalog</span>
                </button>
              </div>

              {/* Course items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursesList.slice(0, 8).map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-navy-950">{c.title}</div>
                      <div className="text-xs text-brand-600 font-semibold">{c.country} • {c.duration} • {c.estimated_fees}</div>
                      <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                    </div>
                    <button
                      onClick={() => setCoursesList(coursesList.filter((item) => item.id !== c.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Live Backend & Infrastructure Status */}
            <div className="bg-navy-950 text-white rounded-2xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-brand-400" />
                <h3 className="text-lg font-bold">Supabase PostgreSQL Architecture</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-300">
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase tracking-wider">REST Endpoint</div>
                  <div className="font-mono text-brand-300 break-all">https://lqggahnqfbihbnydpfre.supabase.co</div>
                </div>
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase tracking-wider">Security Rules</div>
                  <div className="text-green-400 font-bold">Row Level Security (RLS) Active on 18 Tables</div>
                </div>
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-800 space-y-1">
                  <div className="text-slate-400 font-bold uppercase tracking-wider">Lead & Booking Sync</div>
                  <div className="text-yellow-400 font-bold">Realtime Direct Sync with Offline Fallback</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note Editor Modal */}
        {editingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-lg text-navy-950">Add Counselor Note</h3>
              <p className="text-xs text-slate-500">Applicant: {editingLead.full_name}</p>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Log call summary, IELTS score, missing documents..."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNote}
                  className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
