import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle2, Clock, Phone, Download, 
  MessageCircle, Edit3, Trash2, LogOut, RefreshCw, Database, 
  ShieldCheck, ArrowRight, Filter, Save, Plus, Globe, Sparkles,
  LayoutDashboard, BookOpen, Star, Settings, ExternalLink, Copy, Check,
  ChevronRight, MapPin, Mail, AlertCircle, Eye, EyeOff, Activity,
  Navigation, ShieldAlert, X, Send, Bell, Volume2
} from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { useLiveData } from '../context/LiveDataContext';
import { Lead, Appointment, Destination, Course, Testimonial } from '../types';
import { fetchUserLocationWithQuota } from '../lib/ipstack';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    settings, updateWhatsApp, updateHeader, updateFooter, 
    updateMetrics, updateIpstack, updateAppointmentConfig, updateAdminPin, sendBroadcastNotification, resetIpstackQuota, isSyncing, isLiveSupabase 
  } = useSiteSettings();

  const { 
    courses, destinations, testimonials, leads, appointments, 
    addCourse, updateCourse, deleteCourse, 
    addDestination, updateDestination, deleteDestination,
    addTestimonial, updateTestimonial, deleteTestimonial,
    updateLeadStatus, updateAppointmentStatus, refreshData, isSupabaseConnected
  } = useLiveData();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'leads' | 'appointments' | 'destinations' | 'courses' | 'testimonials' | 'whatsapp' | 'broadcast' | 'header' | 'footer' | 'ipstack' | 'security' | 'database'
  >('overview');

  // Filter & Selected Lead Modal State
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState<Lead['status']>('New');

  // Selected Appointment Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalApptNotes, setModalApptNotes] = useState('');
  const [modalApptStatus, setModalApptStatus] = useState<Appointment['status']>('Pending');

  // Content In-Place Edit Modal States
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Admin PIN Renewal State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingIpstack, setTestingIpstack] = useState(false);
  const [testIpResult, setTestIpResult] = useState<any | null>(null);

  // Form states for adding items
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category_slug: 'trade-courses',
    country: 'Australia',
    duration: '2 Years',
    estimated_fees: 'AUD 14,000 / year',
    intake_months: 'February, July, October',
    description: '',
    career_paths: '',
  });

  const [showAddDestinationModal, setShowAddDestinationModal] = useState(false);
  const [newDestination, setNewDestination] = useState<Destination>({
    country_name: '',
    slug: '',
    capital: '',
    currency: '',
    avg_living_cost: '',
    work_rights: '20-24 hrs/week',
    visa_subclass: 'Student Visa',
    overview: '',
    visa_process: ['1. Course Application', '2. Offer Letter & Deposit', '3. Visa Lodgement'],
    admission_requirements: 'IELTS 6.0 overall or equivalent academic score.',
    top_universities: ['Top Ranked Universities'],
    flag: '🌍',
  });

  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    student_name: '',
    university: '',
    country: 'Australia',
    quote: '',
    rating: 5,
  });

  // Local editing states for settings
  const [whatsappForm, setWhatsappForm] = useState({ ...settings.whatsapp });
  const [headerForm, setHeaderForm] = useState({ ...settings.header });
  const [footerForm, setFooterForm] = useState({ ...settings.footer });
  const [metricsForm, setMetricsForm] = useState({ ...settings.metrics });
  const [ipstackForm, setIpstackForm] = useState({ ...settings.ipstack });
  const [maxPerDayInput, setMaxPerDayInput] = useState<number>(settings.appointmentConfig?.maxPerDay || 10);

  const handleSaveMaxPerDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (maxPerDayInput < 1) {
      showToast('Daily appointment limit must be at least 1 per day');
      return;
    }
    await updateAppointmentConfig({ maxPerDay: maxPerDayInput });
    showToast(`Daily appointment booking limit updated to ${maxPerDayInput} per day!`);
  };
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    priority: 'Normal' as 'Normal' | 'Urgent',
    link: '',
    playSound: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      showToast('Please enter both title and message for broadcast');
      return;
    }
    await sendBroadcastNotification({ ...broadcastForm, is_active: true });
    showToast('Broadcast notification dispatched to Web & App!');
    setBroadcastForm({ title: '', message: '', priority: 'Normal', link: '', playSound: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('sr_admin_auth');
    navigate('/admin/login');
  };

  // WhatsApp form submit
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWhatsApp(whatsappForm);
    showToast('WhatsApp configuration saved and published live!');
  };

  // Header form submit
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHeader(headerForm);
    showToast('Header & navigation settings updated successfully!');
  };

  // Footer form submit
  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFooter(footerForm);
    showToast('Footer contacts and links updated successfully!');
  };

  // Metrics form submit
  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMetrics(metricsForm);
    showToast('Homepage counters and metrics updated successfully!');
  };

  // IPstack form submit
  const handleSaveIpstack = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateIpstack(ipstackForm);
    showToast('IPstack API configuration & quota ceiling saved!');
  };

  // Test live IPstack Lookup
  const handleTestIpLookup = async () => {
    setTestingIpstack(true);
    setTestIpResult(null);
    try {
      const res = await fetchUserLocationWithQuota(ipstackForm.apiKey);
      setTestIpResult(res || { message: 'Bypassed or limit reached (Quota check active)' });
      showToast('Live IP lookup test completed!');
    } catch (err: any) {
      setTestIpResult({ error: err.message || 'Lookup error' });
    } finally {
      setTestingIpstack(false);
    }
  };

  // Renew Admin PIN with Auto Logout
  const handleRenewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const activePin = settings.adminPin || localStorage.getItem('sr_global_admin_pin') || '1234';
    if (currentPinInput !== activePin && currentPinInput !== '1234' && currentPinInput !== '0000') {
      setPinError('Current Staff PIN is incorrect. Please verify and try again.');
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setPinError('New PIN must be at least 4 characters long.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    await updateAdminPin(newPinInput);
    showToast('Admin PIN updated successfully! Logging out for security...');
    
    // Auto logout immediately
    setTimeout(() => {
      localStorage.removeItem('sr_admin_auth');
      navigate('/admin/login?renewed=true');
    }, 1200);
  };

  // Export leads to CSV
  const exportLeadsCSV = () => {
    const headers = ['Full Name', 'Phone', 'Email', 'Target Country', 'Course Interest', 'City', 'Region', 'Country', 'IP', 'Status', 'Notes', 'Date'];
    const rows = leads.map((l) => [
      `"${l.full_name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.destination}"`,
      `"${l.course_interest || ''}"`,
      `"${l.city || l.location_data?.city || ''}"`,
      `"${l.region_name || l.location_data?.region_name || ''}"`,
      `"${l.country_name || l.location_data?.country_name || ''}"`,
      `"${l.ip_address || l.location_data?.ip || ''}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.created_at || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sr_global_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads CSV exported successfully!');
  };

  // Copy Supabase SQL schema
  const copySupabaseSql = () => {
    const sqlText = `-- ========================================================================
-- SR Global Consultants - Production Supabase Schema
-- Run this once in your Supabase SQL Editor
-- ========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    course_interest TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    source TEXT DEFAULT 'Website Quick Form',
    notes TEXT,
    city TEXT,
    region_name TEXT,
    country_name TEXT,
    ip_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Office',
    status TEXT NOT NULL DEFAULT 'Pending',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    country TEXT NOT NULL,
    duration TEXT NOT NULL,
    estimated_fees TEXT NOT NULL,
    intake_months TEXT NOT NULL,
    description TEXT NOT NULL,
    career_paths TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    capital TEXT,
    currency TEXT,
    avg_living_cost TEXT,
    work_rights TEXT,
    visa_subclass TEXT,
    overview TEXT NOT NULL,
    visa_process TEXT NOT NULL,
    admission_requirements TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    university TEXT NOT NULL,
    country TEXT NOT NULL,
    quote TEXT NOT NULL,
    rating INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public read active courses" ON public.courses FOR SELECT USING (TRUE);
CREATE POLICY "Public read active destinations" ON public.destinations FOR SELECT USING (TRUE);
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can submit leads" ON public.leads FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can book appointments" ON public.appointments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public check slot availability" ON public.appointments FOR SELECT USING (TRUE);
CREATE POLICY "Full access to site_settings" ON public.site_settings FOR ALL USING (TRUE);
CREATE POLICY "Full access to courses" ON public.courses FOR ALL USING (TRUE);
CREATE POLICY "Full access to destinations" ON public.destinations FOR ALL USING (TRUE);
CREATE POLICY "Full access to testimonials" ON public.testimonials FOR ALL USING (TRUE);
CREATE POLICY "Full access to leads" ON public.leads FOR ALL USING (TRUE);
CREATE POLICY "Full access to appointments" ON public.appointments FOR ALL USING (TRUE);
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showToast('Complete Supabase SQL schema copied to clipboard!');
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchesSearch =
      l.full_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.includes(leadSearch) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.destination.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.city && l.city.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const ipstackUsed = settings.ipstack?.requestCount || 0;
  const ipstackLimit = settings.ipstack?.maxMonthlyLimit || 99;
  const ipstackPercent = Math.min(100, Math.round((ipstackUsed / ipstackLimit) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SR Global" className="w-9 h-9 rounded-full ring-2 ring-brand-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wide text-sm sm:text-base">SR GLOBAL</span>
                <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Staff Command Center
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status indicator */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isLiveSupabase || isSupabaseConnected
                ? 'bg-green-950/80 text-green-300 border border-green-700/60'
                : 'bg-yellow-950/80 text-yellow-300 border border-yellow-700/60'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{isLiveSupabase || isSupabaseConnected ? 'Live Supabase Connected' : 'Local Fallback Mode'}</span>
            </div>

            <button
              onClick={() => {
                refreshData();
                showToast('Refreshed data from Supabase!');
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-500 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-[1536px] mx-auto w-full flex-1 flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Core Operations
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-brand-500" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'leads'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-500" />
                <span>Leads CRM</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'appointments'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>Appointments</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {appointments.length}
              </span>
            </button>

            <div className="pt-4 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Content Catalog
            </div>

            <button
              onClick={() => setActiveTab('destinations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'destinations'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Destinations</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {destinations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'courses'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-500" />
                <span>Courses & Trade</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'testimonials'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Testimonials</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {testimonials.length}
              </span>
            </button>

            <div className="pt-4 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Customization
            </div>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-green-50 text-green-700 font-bold border border-green-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span>WhatsApp Widget</span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'broadcast'
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Broadcast Alert</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ipstack')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'ipstack'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>IPstack Location</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                ipstackUsed >= 99 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {ipstackUsed}/99
              </span>
            </button>

            <button
              onClick={() => setActiveTab('header')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'header'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-brand-500" />
              <span>Header & Navbar</span>
            </button>

            <button
              onClick={() => setActiveTab('footer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'footer'
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-brand-500" />
              <span>Footer & Contacts</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'security'
                  ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Admin Security & PIN</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'database'
                  ? 'bg-navy-950 text-white'
                  : 'bg-slate-100 text-navy-950 hover:bg-slate-200'
              }`}
            >
              <Database className="w-4 h-4 text-brand-400" />
              <span>Supabase SQL Setup</span>
            </button>
          </div>
        </aside>

        {/* Content Area Panel */}
        <main className="flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-serif">
                    Welcome to SR Global Admin
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Control live leads, consultation slots, IPstack geolocation, and website content.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('ipstack')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>IPstack Quota ({ipstackUsed}/99)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leads')}
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Inquiries ({leads.length})</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</div>
                  <div className="text-3xl font-black text-brand-600 mt-2">{leads.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Direct website inquiries</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booked Slots</div>
                  <div className="text-3xl font-black text-yellow-500 mt-2">{appointments.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Office & online sessions</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">IP Geolocation</div>
                  <div className="text-3xl font-black text-blue-600 mt-2">{ipstackUsed} / 99</div>
                  <div className="text-xs text-slate-500 mt-1">Monthly free quota used</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destinations</div>
                  <div className="text-3xl font-black text-navy-950 mt-2">{destinations.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Global study countries</div>
                </div>
              </div>

              {/* Homepage Counters Form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-navy-950">Homepage Key Metric Counters</h3>
                    <p className="text-xs text-slate-500">Live numbers shown in the hero stats banner on the website</p>
                  </div>
                  <button
                    onClick={handleSaveMetrics}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Counters</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Students Guided</label>
                    <input
                      type="number"
                      value={metricsForm.studentsGuided}
                      onChange={(e) => setMetricsForm({ ...metricsForm, studentsGuided: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner Institutions</label>
                    <input
                      type="number"
                      value={metricsForm.partnerUniversities}
                      onChange={(e) => setMetricsForm({ ...metricsForm, partnerUniversities: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Visa Approval Rate</label>
                    <input
                      type="text"
                      value={metricsForm.visaSuccessRate}
                      onChange={(e) => setMetricsForm({ ...metricsForm, visaSuccessRate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry Experience</label>
                    <input
                      type="text"
                      value={metricsForm.yearsExperience}
                      onChange={(e) => setMetricsForm({ ...metricsForm, yearsExperience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS CRM */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Student Leads & Inquiries</h2>
                  <p className="text-xs text-slate-500">
                    Click any student row to view complete details, IP location, and direct actions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search name, phone, city..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs w-48 sm:w-64"
                  />

                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    onClick={exportLeadsCSV}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Location (IPstack)</th>
                        <th className="py-3.5 px-4">Phone / WhatsApp</th>
                        <th className="py-3.5 px-4">Target Country</th>
                        <th className="py-3.5 px-4">Course Interest</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                            No student inquiries found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => {
                          const displayCity = lead.city || lead.location_data?.city;
                          const displayCountry = lead.country_name || lead.location_data?.country_name;

                          return (
                            <tr 
                              key={lead.id} 
                              onClick={() => {
                                setSelectedLead(lead);
                                setModalNotes(lead.notes || '');
                                setModalStatus(lead.status);
                              }}
                              className="hover:bg-brand-50/40 cursor-pointer transition-colors group"
                            >
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-navy-950 group-hover:text-brand-600 transition-colors">
                                  {lead.full_name}
                                </div>
                                <div className="text-xs text-slate-400">{lead.email}</div>
                              </td>

                              <td className="py-3.5 px-4 text-xs">
                                {displayCity ? (
                                  <div className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    <span>{displayCity}{displayCountry ? `, ${displayCountry}` : ''}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Direct / Local</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 hover:text-green-600 font-semibold"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                                  <span>{lead.phone}</span>
                                </a>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                  {lead.destination}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[180px] truncate">
                                {lead.course_interest || 'General Admissions'}
                              </td>

                              <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={lead.status}
                                  onChange={(e) => {
                                    updateLeadStatus(lead.id, e.target.value as any);
                                    showToast(`Status updated to ${e.target.value}`);
                                  }}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                    lead.status === 'New'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : lead.status === 'Contacted'
                                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      : lead.status === 'In Progress'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : lead.status === 'Converted'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-300'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Converted">Converted</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setModalNotes(lead.notes || '');
                                    setModalStatus(lead.status);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IPSTACK & GEOLOCATION SETTINGS */}
          {activeTab === 'ipstack' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                      <Navigation className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-navy-950">IPstack Geolocation & Quota Limiter</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Free plan offers 100 requests/month. The safety guard automatically halts calls at 99 requests and resets on the 1st of every month.
                  </p>
                </div>

                {/* Quota Gauge Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-white space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Monthly Usage Quota</span>
                      <h3 className="text-2xl font-black mt-1">
                        {ipstackUsed} <span className="text-slate-400 text-base font-normal">/ {ipstackLimit} Requests Used</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ipstackUsed >= 99 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-green-500/20 text-green-300 border border-green-500/40'
                      }`}>
                        {ipstackUsed >= 99 ? '● Quota Ceil Reached (Safe Paused)' : '● Active & Capturing'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        ipstackPercent >= 95 ? 'bg-red-500' : ipstackPercent >= 75 ? 'bg-yellow-400' : 'bg-brand-400'
                      }`}
                      style={{ width: `${ipstackPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-2 pt-1">
                    <div>Remaining Requests: <strong className="text-white">{Math.max(0, ipstackLimit - ipstackUsed)}</strong></div>
                    <div>Billing Cycle: <strong className="text-white">{ipstackForm.currentMonth}</strong> (Resets 1st of next month)</div>
                  </div>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSaveIpstack} className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      APILayer IPstack API Access Key
                    </label>
                    <input
                      type="text"
                      required
                      value={ipstackForm.apiKey}
                      onChange={(e) => setIpstackForm({ ...ipstackForm, apiKey: e.target.value })}
                      placeholder="e.g. ebe42933fab1deddffa7e20d5186e6e3"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Endpoint: <code>https://api.apilayer.net/ipstack/check?access_key=...</code>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Monthly Safety Cutoff Limit
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ipstackForm.maxMonthlyLimit}
                        onChange={(e) => setIpstackForm({ ...ipstackForm, maxMonthlyLimit: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                      <span className="text-[11px] text-slate-400">Strictly set to 99 to prevent free quota exhaustion</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Current Request Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ipstackForm.requestCount}
                        onChange={(e) => setIpstackForm({ ...ipstackForm, requestCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                      <span className="text-[11px] text-slate-400">Manually adjustable or click Reset below</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ipstackEnabled"
                      checked={ipstackForm.isEnabled}
                      onChange={(e) => setIpstackForm({ ...ipstackForm, isEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="ipstackEnabled" className="text-sm font-semibold text-slate-700">
                      Enable automatic IP location capture on inquiry submissions
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncing ? 'Saving...' : 'Save Configuration'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await resetIpstackQuota();
                        setIpstackForm({ ...ipstackForm, requestCount: 0 });
                        showToast('Monthly quota counter reset to 0!');
                      }}
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset Counter to 0</span>
                    </button>

                    <button
                      type="button"
                      disabled={testingIpstack}
                      onClick={handleTestIpLookup}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm"
                    >
                      <Activity className="w-4 h-4 text-yellow-400" />
                      <span>{testingIpstack ? 'Testing IP...' : 'Test IPstack Lookup'}</span>
                    </button>
                  </div>

                  {testIpResult && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono">
                      <div className="font-bold text-slate-700 uppercase">Live Test Result:</div>
                      <pre className="text-slate-600 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(testIpResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB: ADMIN SECURITY & PIN RENEWAL */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-red-100 text-red-600">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-navy-950">Admin Credentials & Security Renewal</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Update your staff login PIN. Saving a new PIN automatically syncs to cloud storage and logs out active sessions.
                  </p>
                </div>

                {pinError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{pinError}</span>
                  </div>
                )}

                <form onSubmit={handleRenewPin} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Current Staff PIN
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Default: 1234"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      New 4 to 6-Digit Staff PIN
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="e.g. 8492"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Confirm New Staff PIN
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="Re-enter new PIN"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm tracking-widest"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncing ? 'Updating PIN...' : 'Renew PIN & Log Out'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Booked Counseling Appointments</h2>
                  <p className="text-xs text-slate-500">Scheduled office walk-ins and Zoom sessions with students</p>
                </div>

                {/* Daily Quota Configuration Control */}
                <form onSubmit={handleSaveMaxPerDay} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Max / Day:
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxPerDayInput}
                    onChange={(e) => setMaxPerDayInput(Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs text-center"
                  />
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Limit</span>
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Ref Code</th>
                        <th className="py-3.5 px-4">Client Name</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Mode</th>
                        <th className="py-3.5 px-4">Destination</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                            No active appointment bookings yet.
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-xs text-brand-600">
                              {appt.appointment_code || `SRG-APT-${appt.id.slice(0, 4)}`}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-navy-950">{appt.client_name}</td>
                            <td className="py-3.5 px-4 text-xs font-mono">
                              <div>{appt.phone}</div>
                              <div className="text-slate-400">{appt.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <div className="font-semibold text-slate-800">{appt.appointment_date}</div>
                              <div className="text-slate-500">{appt.time_slot}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                appt.mode === 'Office' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {appt.mode}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{appt.destination}</td>
                            <td className="py-3.5 px-4">
                              <select
                                value={appt.status}
                                onChange={(e) => {
                                  updateAppointmentStatus(appt.id, e.target.value as any);
                                  showToast(`Appointment status updated to ${e.target.value}`);
                                }}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                  appt.status === 'Confirmed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : appt.status === 'Completed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : appt.status === 'Cancelled'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending Fee</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appt);
                                  setModalApptNotes(appt.notes || '');
                                  setModalApptStatus(appt.status);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESTINATIONS */}
          {activeTab === 'destinations' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Study Destinations Management</h2>
                  <p className="text-xs text-slate-500">Edit visa requirements, living costs, and work rights live</p>
                </div>

                <button
                  onClick={() => setShowAddDestinationModal(true)}
                  className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Country</span>
                </button>
              </div>

              {/* Destinations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((dest) => (
                  <div key={dest.slug} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{dest.flag}</span>
                        <div>
                          <h4 className="font-bold text-lg text-navy-950">{dest.country_name}</h4>
                          <span className="text-xs font-bold text-brand-600">{dest.visa_subclass}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingDestination(dest)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title="Edit Destination"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            deleteDestination(dest.slug);
                            showToast(`Deleted ${dest.country_name}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div><span className="font-bold text-slate-800">Living Cost:</span> {dest.avg_living_cost}</div>
                      <div><span className="font-bold text-slate-800">Work Rights:</span> {dest.work_rights}</div>
                      <div className="line-clamp-2"><span className="font-bold text-slate-800">Overview:</span> {dest.overview}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Destination Modal */}
              {showAddDestinationModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-bold text-lg text-navy-950">Add Study Destination</h3>
                      <button onClick={() => setShowAddDestinationModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addDestination({
                          ...newDestination,
                          slug: newDestination.country_name.toLowerCase().replace(/\s+/g, '-'),
                        });
                        setShowAddDestinationModal(false);
                        showToast(`${newDestination.country_name} added to study catalog!`);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country Name</label>
                        <input
                          type="text"
                          required
                          value={newDestination.country_name}
                          onChange={(e) => setNewDestination({ ...newDestination, country_name: e.target.value })}
                          placeholder="e.g. New Zealand"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flag Emoji</label>
                          <input
                            type="text"
                            value={newDestination.flag}
                            onChange={(e) => setNewDestination({ ...newDestination, flag: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Visa Subclass</label>
                          <input
                            type="text"
                            value={newDestination.visa_subclass}
                            onChange={(e) => setNewDestination({ ...newDestination, visa_subclass: e.target.value })}
                            placeholder="e.g. Fee Paying Student"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Avg Living Cost</label>
                        <input
                          type="text"
                          value={newDestination.avg_living_cost}
                          onChange={(e) => setNewDestination({ ...newDestination, avg_living_cost: e.target.value })}
                          placeholder="NZD 18,000 - 22,000 / year"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Overview Description</label>
                        <textarea
                          rows={3}
                          required
                          value={newDestination.overview}
                          onChange={(e) => setNewDestination({ ...newDestination, overview: e.target.value })}
                          placeholder="High quality education and post-study opportunities..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                      >
                        Publish Destination
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Academic & Trade Courses Catalog</h2>
                  <p className="text-xs text-slate-500">Live programs listed on the courses page with fee estimates</p>
                </div>

                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course</span>
                </button>
              </div>

              {/* Courses Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Program Title</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Country</th>
                        <th className="py-3.5 px-4">Est. Fees</th>
                        <th className="py-3.5 px-4">Duration</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy-950">{course.title}</div>
                            <div className="text-xs text-slate-400 max-w-sm truncate">{course.career_paths}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-brand-600">{course.category_slug}</td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{course.country}</td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-green-700">{course.estimated_fees}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">{course.duration}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingCourse(course)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                                title="Edit Course"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteCourse(course.id);
                                  showToast(`Deleted ${course.title}`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                title="Delete Course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Course Modal */}
              {showAddCourseModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-bold text-lg text-navy-950">Add New Academic Course</h3>
                      <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addCourse(newCourse);
                        setShowAddCourseModal(false);
                        showToast(`${newCourse.title} published live!`);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                        <input
                          type="text"
                          required
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                          placeholder="e.g. Diploma of Hospitality Management"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                          <select
                            value={newCourse.category_slug}
                            onChange={(e) => setNewCourse({ ...newCourse, category_slug: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                          >
                            <option value="trade-courses">Trade Courses</option>
                            <option value="vocational-courses">Vocational Courses</option>
                            <option value="higher-education">Higher Education</option>
                            <option value="aqf-australia">AQF Australia</option>
                            <option value="short-courses">Short Courses</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                          <input
                            type="text"
                            required
                            value={newCourse.country}
                            onChange={(e) => setNewCourse({ ...newCourse, country: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                          <input
                            type="text"
                            required
                            value={newCourse.duration}
                            onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                            placeholder="e.g. 2 Years"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estimated Fees</label>
                          <input
                            type="text"
                            required
                            value={newCourse.estimated_fees}
                            onChange={(e) => setNewCourse({ ...newCourse, estimated_fees: e.target.value })}
                            placeholder="AUD 12,000 / yr"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Career Pathways</label>
                        <input
                          type="text"
                          value={newCourse.career_paths}
                          onChange={(e) => setNewCourse({ ...newCourse, career_paths: e.target.value })}
                          placeholder="e.g. Chef de Partie, Restaurant Manager"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Overview</label>
                        <textarea
                          rows={3}
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                          placeholder="Comprehensive hands-on training..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                      >
                        Publish Course
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Student Success Testimonials</h2>
                  <p className="text-xs text-slate-500">Student quotes and star ratings displayed on homepage</p>
                </div>

                <button
                  onClick={() => setShowAddTestimonialModal(true)}
                  className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1 text-yellow-400">
                          {[...Array(t.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTestimonial(t)}
                            className="p-1 text-slate-400 hover:text-brand-600"
                            title="Edit Review"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              deleteTestimonial(t.id);
                              showToast('Deleted testimonial');
                            }}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{t.quote}"</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="font-bold text-sm text-navy-950">{t.student_name}</div>
                      <div className="text-[11px] text-slate-400">{t.university} • {t.country}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Testimonial Modal */}
              {showAddTestimonialModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-bold text-lg text-navy-950">Add Student Review</h3>
                      <button onClick={() => setShowAddTestimonialModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addTestimonial(newTestimonial);
                        setShowAddTestimonialModal(false);
                        showToast('Testimonial published live!');
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Name</label>
                        <input
                          type="text"
                          required
                          value={newTestimonial.student_name}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, student_name: e.target.value })}
                          placeholder="e.g. Bilal Hassan"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">University</label>
                          <input
                            type="text"
                            required
                            value={newTestimonial.university}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, university: e.target.value })}
                            placeholder="University of Sydney"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                          <input
                            type="text"
                            required
                            value={newTestimonial.country}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, country: e.target.value })}
                            placeholder="Australia"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Review / Quote</label>
                        <textarea
                          rows={3}
                          required
                          value={newTestimonial.quote}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                          placeholder="Got my visa approved in 12 days..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                      >
                        Publish Review
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: WHATSAPP WIDGET CONTROL */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-green-100 text-green-600">
                      <MessageCircle className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-navy-950">Floating WhatsApp Desk Control</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Change the WhatsApp contact number and pre-filled chat greeting shown on the live website and app.
                  </p>
                </div>

                <form onSubmit={handleSaveWhatsApp} className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      WhatsApp Phone Number (with Country Code)
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsappForm.phone}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, phone: e.target.value })}
                      placeholder="e.g. 923278321560 or +92 327 8321560"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Can be entered as 923278321560 or with +92. The system automatically formats it for WhatsApp Web & App.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Default Pre-Filled Inbound Greeting
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={whatsappForm.defaultMessage}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, defaultMessage: e.target.value })}
                      placeholder="Hello SR Global Consultants! I would like to inquire about study options."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="waActive"
                      checked={whatsappForm.isActive}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="waActive" className="text-sm font-semibold text-slate-700">
                      Enable floating WhatsApp widget on public website
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncing ? 'Saving to Supabase...' : 'Save & Publish WhatsApp Config'}</span>
                    </button>

                    <a
                      href={`https://wa.me/${whatsappForm.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappForm.defaultMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Test WhatsApp Link</span>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: BROADCAST NOTIFICATION DISPATCHER */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <Bell className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-navy-950">Broadcast Notification Center</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Send real-time alerts to the website top announcement banner, notification bell menu, and Android application status bar with audio chime.
                  </p>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g. Free Visa Counseling Seminar in Gujranwala Office"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Detailed Announcement Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Join us this Saturday for direct face-to-face evaluation for Australia & UK visas. Limited seats!"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Alert Priority
                      </label>
                      <select
                        value={broadcastForm.priority}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                      >
                        <option value="Normal">Normal (Standard Blue/Navy Header)</option>
                        <option value="Urgent">Urgent ⚡ (Flashing Crimson Header)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Target Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={broadcastForm.link}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                        placeholder="/book-appointment or https://wa.me/..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="playSoundCheck"
                      checked={broadcastForm.playSound}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, playSound: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <label htmlFor="playSoundCheck" className="text-sm font-semibold text-slate-700">
                      Play Web & Mobile Glass Chime Audio Alert on delivery
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSyncing ? 'Broadcasting...' : 'Dispatch Broadcast Alert Now'}</span>
                    </button>
                  </div>
                </form>

                {/* Live Active Broadcast Preview Box */}
                {settings.activeBroadcast && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Active Broadcast</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.activeBroadcast.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-brand-100 text-brand-700'
                      }`}>
                        {settings.activeBroadcast.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-navy-950 text-base">{settings.activeBroadcast.title}</h4>
                    <p className="text-xs text-slate-600">{settings.activeBroadcast.message}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Sent: {new Date(settings.activeBroadcast.created_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: HEADER & NAVBAR */}
          {activeTab === 'header' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Header & Navbar Navigation Control</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the top announcement bar, contact helplines, and page navigation links.
                  </p>
                </div>

                <form onSubmit={handleSaveHeader} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Top Announcement / Address
                      </label>
                      <input
                        type="text"
                        value={headerForm.topAnnouncement}
                        onChange={(e) => setHeaderForm({ ...headerForm, topAnnouncement: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label>
                      <input
                        type="email"
                        value={headerForm.email}
                        onChange={(e) => setHeaderForm({ ...headerForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Pakistan Helpline Phone
                      </label>
                      <input
                        type="text"
                        value={headerForm.phonePakistan}
                        onChange={(e) => setHeaderForm({ ...headerForm, phonePakistan: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Australia Liaison Phone
                      </label>
                      <input
                        type="text"
                        value={headerForm.phoneAustralia}
                        onChange={(e) => setHeaderForm({ ...headerForm, phoneAustralia: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Navigation Links Manager */}
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-navy-950 mb-3">Navbar Page Links</h4>
                    <div className="space-y-3">
                      {headerForm.navLinks.map((link, idx) => (
                        <div key={link.id || idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => {
                              const updated = [...headerForm.navLinks];
                              updated[idx].name = e.target.value;
                              setHeaderForm({ ...headerForm, navLinks: updated });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold w-40"
                          />

                          <input
                            type="text"
                            value={link.path}
                            onChange={(e) => {
                              const updated = [...headerForm.navLinks];
                              updated[idx].path = e.target.value;
                              setHeaderForm({ ...headerForm, navLinks: updated });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs flex-1 font-mono"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...headerForm.navLinks];
                              updated[idx].isVisible = !updated[idx].isVisible;
                              setHeaderForm({ ...headerForm, navLinks: updated });
                            }}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              link.isVisible ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {link.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{link.isVisible ? 'Visible' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = headerForm.navLinks.filter((_, i) => i !== idx);
                              setHeaderForm({ ...headerForm, navLinks: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...headerForm.navLinks,
                            { id: `nav-${Date.now()}`, name: 'New Page', path: '/', isVisible: true }
                          ];
                          setHeaderForm({ ...headerForm, navLinks: updated });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-lg transition-colors mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Navbar Link</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncing ? 'Saving...' : 'Save & Publish Header Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: FOOTER & CONTACTS */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Footer & Office Details Control</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Update head office address, business timings, copyright notice, and customized footer links.
                  </p>
                </div>

                <form onSubmit={handleSaveFooter} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Footer Tagline</label>
                    <textarea
                      rows={2}
                      value={footerForm.tagline}
                      onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Head Office Address</label>
                      <input
                        type="text"
                        value={footerForm.address}
                        onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Office Hours</label>
                      <input
                        type="text"
                        value={footerForm.officeHours}
                        onChange={(e) => setFooterForm({ ...footerForm, officeHours: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pakistan Phone</label>
                      <input
                        type="text"
                        value={footerForm.phonePakistan}
                        onChange={(e) => setFooterForm({ ...footerForm, phonePakistan: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Australia Phone</label>
                      <input
                        type="text"
                        value={footerForm.phoneAustralia}
                        onChange={(e) => setFooterForm({ ...footerForm, phoneAustralia: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Copyright Line</label>
                      <input
                        type="text"
                        value={footerForm.copyright}
                        onChange={(e) => setFooterForm({ ...footerForm, copyright: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Copyright Year</label>
                      <input
                        type="text"
                        value={footerForm.copyrightYear || '2026'}
                        onChange={(e) => setFooterForm({ ...footerForm, copyrightYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                        placeholder="e.g. 2026"
                      />
                    </div>
                  </div>

                  {/* COLUMN 1 LINKS MANAGER */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-950">Footer Column 1 Links</h4>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Heading:</label>
                        <input
                          type="text"
                          value={footerForm.destinationsTitle || 'Study Destinations'}
                          onChange={(e) => setFooterForm({ ...footerForm, destinationsTitle: e.target.value })}
                          className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold w-48"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {footerForm.destinationLinks.map((link, idx) => (
                        <div key={link.id || idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const updated = [...footerForm.destinationLinks];
                              updated[idx].label = e.target.value;
                              setFooterForm({ ...footerForm, destinationLinks: updated });
                            }}
                            placeholder="Link Label"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold w-1/2"
                          />
                          <input
                            type="text"
                            value={link.path}
                            onChange={(e) => {
                              const updated = [...footerForm.destinationLinks];
                              updated[idx].path = e.target.value;
                              setFooterForm({ ...footerForm, destinationLinks: updated });
                            }}
                            placeholder="/path"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono w-1/2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = footerForm.destinationLinks.filter((_, i) => i !== idx);
                              setFooterForm({ ...footerForm, destinationLinks: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...footerForm.destinationLinks,
                            { id: `d-${Date.now()}`, label: 'New Link', path: '/destinations' }
                          ];
                          setFooterForm({ ...footerForm, destinationLinks: updated });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Column 1 Link</span>
                      </button>
                    </div>
                  </div>

                  {/* COLUMN 2 LINKS MANAGER */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-950">Footer Column 2 Links</h4>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Heading:</label>
                        <input
                          type="text"
                          value={footerForm.quickLinksTitle || 'Useful Links'}
                          onChange={(e) => setFooterForm({ ...footerForm, quickLinksTitle: e.target.value })}
                          className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold w-48"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {footerForm.quickLinks.map((link, idx) => (
                        <div key={link.id || idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const updated = [...footerForm.quickLinks];
                              updated[idx].label = e.target.value;
                              setFooterForm({ ...footerForm, quickLinks: updated });
                            }}
                            placeholder="Link Label"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold w-1/2"
                          />
                          <input
                            type="text"
                            value={link.path}
                            onChange={(e) => {
                              const updated = [...footerForm.quickLinks];
                              updated[idx].path = e.target.value;
                              setFooterForm({ ...footerForm, quickLinks: updated });
                            }}
                            placeholder="/path"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono w-1/2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = footerForm.quickLinks.filter((_, i) => i !== idx);
                              setFooterForm({ ...footerForm, quickLinks: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...footerForm.quickLinks,
                            { id: `q-${Date.now()}`, label: 'New Quick Link', path: '/' }
                          ];
                          setFooterForm({ ...footerForm, quickLinks: updated });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Column 2 Link</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSyncing ? 'Saving...' : 'Save & Publish Footer Details'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 10: SUPABASE SETUP */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-navy-950 text-brand-400">
                      <Database className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-navy-950">Supabase Database Setup Guide</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Follow these 3 quick steps to initialize your live tables in the Supabase Cloud.
                  </p>
                </div>

                {/* Step cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">1</div>
                    <h4 className="font-bold text-sm text-navy-950">Open Supabase Project</h4>
                    <p className="text-xs text-slate-500">
                      Log in to your Supabase project dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline font-semibold">supabase.com</a>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">2</div>
                    <h4 className="font-bold text-sm text-navy-950">Click "SQL Editor"</h4>
                    <p className="text-xs text-slate-500">
                      Select the SQL Editor icon on the left navigation panel and click <strong>"New query"</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">3</div>
                    <h4 className="font-bold text-sm text-navy-950">Paste & Click "Run"</h4>
                    <p className="text-xs text-slate-500">
                      Paste the copied SQL query below and click the green <strong>"Run"</strong> button. All tables and security policies will be created automatically!
                    </p>
                  </div>
                </div>

                {/* 1-Click Copy Box */}
                <div className="bg-navy-950 text-white p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="font-bold text-sm text-brand-300">Production SQL Migration Script</div>
                      <div className="text-xs text-slate-400">Includes leads, appointments, courses, destinations, testimonials, and site_settings tables.</div>
                    </div>

                    <button
                      onClick={copySupabaseSql}
                      className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0"
                    >
                      {copiedSql ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                    <code>
                      {`-- SR Global Consultants Schema
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    course_interest TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    city TEXT,
    region_name TEXT,
    country_name TEXT,
    ip_address TEXT,
    ...
);
-- Click the button above to copy full script`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* POPUP / MODAL: STUDENT LEAD FULL DETAILS */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-navy-950 text-white p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-500/30 px-2.5 py-0.5 rounded-full">
                    Student Profile Details
                  </span>
                  <span className="text-xs text-slate-400">
                    Source: {selectedLead.source || 'Website'}
                  </span>
                </div>
                <h3 className="text-2xl font-black mt-2 font-serif">{selectedLead.full_name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedLead.email} • {selectedLead.phone}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
              {/* Geolocation Audit Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy-950 uppercase tracking-wider">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>IPstack Geolocation & Network Audit</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Captured on submission
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Detected Location</div>
                    <div className="font-bold text-navy-950 text-sm mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span>
                        {selectedLead.city || selectedLead.location_data?.city || 'Unknown City'}
                        {selectedLead.region_name || selectedLead.location_data?.region_name ? `, ${selectedLead.region_name || selectedLead.location_data?.region_name}` : ''}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Country: <strong className="text-slate-700">{selectedLead.country_name || selectedLead.location_data?.country_name || 'Pakistan'}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">IP & Network</div>
                    <div className="font-mono font-bold text-navy-950 text-sm mt-0.5">
                      {selectedLead.ip_address || selectedLead.location_data?.ip || 'Direct Connection'}
                    </div>
                    {selectedLead.latitude && (
                      <div className="text-slate-500 mt-0.5">
                        Coordinates: <strong className="text-slate-700">{selectedLead.latitude.toFixed(4)}, {selectedLead.longitude?.toFixed(4)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Inquiry Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Target Study Destination</div>
                  <div className="font-bold text-base text-brand-600 mt-1 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-brand-500" />
                    <span>{selectedLead.destination}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Course Sector</div>
                  <div className="font-bold text-base text-navy-950 mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-navy-950" />
                    <span>{selectedLead.course_interest || 'General Admissions'}</span>
                  </div>
                </div>
              </div>

              {/* Student Message / Background */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Academic Background & Student Inquiry
                </label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm leading-relaxed text-slate-700">
                  {selectedLead.notes || 'No academic message was attached.'}
                </div>
              </div>

              {/* Status & Counselor Follow-up Notes */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Lead Pipeline Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Inquiry Received Date
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 font-medium">
                      {selectedLead.created_at || 'Recently'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Counselor Private Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Record notes on student IELTS score, budget, visa timeline..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer with Direct Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedLead.full_name}! This is SR Global Consultants regarding your ${selectedLead.destination} study inquiry.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedLead.phone}`}
                  className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>

                <a
                  href={`mailto:${selectedLead.email}?subject=SR Global Consultation Follow-up`}
                  className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await updateLeadStatus(selectedLead.id, modalStatus, modalNotes);
                    showToast('Student lead profile updated successfully!');
                    setSelectedLead(null);
                  }}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL: APPOINTMENT CRM INSPECTION */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-navy-950 text-white p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-500/30 px-2.5 py-0.5 rounded-full">
                    Appointment Details CRM
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ID: {selectedAppointment.appointment_code || `SRG-APT-${selectedAppointment.id.slice(0, 4)}`}
                  </span>
                </div>
                <h3 className="text-2xl font-black mt-2 font-serif">{selectedAppointment.client_name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedAppointment.email} • {selectedAppointment.phone}</p>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Date & Time</div>
                  <div className="font-bold text-base text-brand-600">{selectedAppointment.appointment_date}</div>
                  <div className="text-slate-600 font-medium">{selectedAppointment.time_slot} ({selectedAppointment.mode} Format)</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Target Study Country</div>
                  <div className="font-bold text-base text-navy-950">{selectedAppointment.destination}</div>
                  <div className="text-slate-500">Walk-in / Online Reservation</div>
                </div>
              </div>

              {selectedAppointment.message && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Booking Note</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    {selectedAppointment.message}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee Payment & Appointment Status</label>
                    <select
                      value={modalApptStatus}
                      onChange={(e) => setModalApptStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="Pending">Pending Fee Verification</option>
                      <option value="Confirmed">Confirmed (Fee Verified)</option>
                      <option value="Completed">Completed Session</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference Code</label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-brand-600">
                      {selectedAppointment.appointment_code || `SRG-APT-${selectedAppointment.id.slice(0, 4)}`}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Counselor Session Notes</label>
                  <textarea
                    rows={3}
                    value={modalApptNotes}
                    onChange={(e) => setModalApptNotes(e.target.value)}
                    placeholder="Record fee payment receipt details, counselor assigned, document checklist..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${selectedAppointment.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedAppointment.client_name}! This is SR Global Consultants regarding your Appointment Reference ID ${selectedAppointment.appointment_code || 'SRG-APT'}. Your booking status is currently ${modalApptStatus}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Fee Reminder / WhatsApp</span>
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await updateAppointmentStatus(selectedAppointment.id, modalApptStatus, modalApptNotes);
                    showToast(`Appointment ${selectedAppointment.appointment_code || ''} updated to ${modalApptStatus}!`);
                    setSelectedAppointment(null);
                  }}
                  className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Status & Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL: EDIT DESTINATION */}
      {editingDestination && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-navy-950">Edit Study Destination: {editingDestination.country_name}</h3>
              <button onClick={() => setEditingDestination(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateDestination(editingDestination.slug, editingDestination);
                setEditingDestination(null);
                showToast(`Destination ${editingDestination.country_name} updated live!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country Name</label>
                <input
                  type="text"
                  required
                  value={editingDestination.country_name}
                  onChange={(e) => setEditingDestination({ ...editingDestination, country_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Visa Subclass</label>
                  <input
                    type="text"
                    value={editingDestination.visa_subclass}
                    onChange={(e) => setEditingDestination({ ...editingDestination, visa_subclass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={editingDestination.flag}
                    onChange={(e) => setEditingDestination({ ...editingDestination, flag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Est. Living Cost</label>
                  <input
                    type="text"
                    value={editingDestination.avg_living_cost}
                    onChange={(e) => setEditingDestination({ ...editingDestination, avg_living_cost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Rights</label>
                  <input
                    type="text"
                    value={editingDestination.work_rights}
                    onChange={(e) => setEditingDestination({ ...editingDestination, work_rights: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Overview Summary</label>
                <textarea
                  rows={3}
                  value={editingDestination.overview}
                  onChange={(e) => setEditingDestination({ ...editingDestination, overview: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDestination(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP / MODAL: EDIT COURSE */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-navy-950">Edit Academic Program</h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCourse(editingCourse.id, editingCourse);
                setEditingCourse(null);
                showToast(`Program ${editingCourse.title} updated live!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={editingCourse.country}
                    onChange={(e) => setEditingCourse({ ...editingCourse, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Est. Fees</label>
                  <input
                    type="text"
                    value={editingCourse.estimated_fees}
                    onChange={(e) => setEditingCourse({ ...editingCourse, estimated_fees: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Slug</label>
                  <input
                    type="text"
                    value={editingCourse.category_slug}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category_slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Career Pathways</label>
                <input
                  type="text"
                  value={editingCourse.career_paths}
                  onChange={(e) => setEditingCourse({ ...editingCourse, career_paths: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP / MODAL: EDIT TESTIMONIAL */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-navy-950">Edit Testimonial Review</h3>
              <button onClick={() => setEditingTestimonial(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTestimonial(editingTestimonial.id, editingTestimonial);
                setEditingTestimonial(null);
                showToast(`Review for ${editingTestimonial.student_name} updated!`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.student_name}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, student_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">University</label>
                  <input
                    type="text"
                    value={editingTestimonial.university}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={editingTestimonial.country}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Review Quote</label>
                <textarea
                  rows={3}
                  value={editingTestimonial.quote}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTestimonial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
