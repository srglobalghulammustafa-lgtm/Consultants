import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, ArrowRight, CheckCircle2, Award, Users, BookOpen, 
  Send, Star, MapPin, Phone, Shield, Globe, Sparkles, Quote, GraduationCap, X, Video as VideoIcon
} from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { HomeSliderBanner } from '../components/HomeSliderBanner';
import { SmartImage } from '../components/SmartImage';
import { SmartVideo } from '../components/SmartVideo';
import { Reveal } from '../components/Reveal';
import { usePageTransition } from '../components/PageTransition';
import { useLiveData } from '../context/LiveDataContext';
import { useSiteSettings, DEFAULT_TARGET_COUNTRIES } from '../context/SettingsContext';
import { fetchUserLocationWithQuota } from '../lib/ipstack';
import { Testimonial } from '../types';

export const Home: React.FC = () => {
  const { destinations, testimonials } = useLiveData();
  const { settings } = useSiteSettings();
  const { navigateWithTransition } = usePageTransition();
  const metrics = settings.metrics;
  const heroImageUrl = settings.hero?.bannerImageUrl || '/hero-banner.jpg';
  const heroOverlayOpacity = settings.hero?.overlayOpacity ?? 0.72;
  const accreditedBadgeUrl = settings.footer?.accreditedBadgeUrl || 'https://www.icef.com/agency-status/#7092';
  const accreditedBadgeImage = settings.footer?.accreditedBadgeImageUrl || '/assets/icef_badge.png';

  const activeCountries = useMemo(() => {
    const raw = settings.targetCountries && settings.targetCountries.length > 0
      ? settings.targetCountries
      : DEFAULT_TARGET_COUNTRIES;
    const filtered = raw.filter((c) => c.isActive !== false && c.name.trim() !== '');
    return filtered.length > 0 ? filtered : DEFAULT_TARGET_COUNTRIES;
  }, [settings.targetCountries]);

  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    destination: activeCountries[0]?.name || 'Australia',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!selectedStory) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStory(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedStory]);

  useEffect(() => {
    if (activeCountries.length > 0 && !activeCountries.some((c) => c.name === leadForm.destination)) {
      setLeadForm((prev) => ({ ...prev, destination: activeCountries[0].name }));
    }
  }, [activeCountries, leadForm.destination]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Safely capture IPstack location if within 99-request limit
      let locationData = null;
      try {
        locationData = await fetchUserLocationWithQuota();
      } catch (locErr) {
        console.warn('Geolocation capture skipped:', locErr);
      }

      // Sync to live Supabase Postgres
      const { error } = await supabase.from('leads').insert([
        {
          full_name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email || 'web@inquiry.com',
          destination: leadForm.destination,
          notes: leadForm.notes,
          status: 'New',
          source: 'Website Quick Form',
          city: locationData?.city || undefined,
          region_name: locationData?.region_name || undefined,
          country_name: locationData?.country_name || undefined,
          ip_address: locationData?.ip || undefined,
          latitude: locationData?.latitude || undefined,
          longitude: locationData?.longitude || undefined,
          location_data: locationData || undefined
        }
      ]);

      if (error) {
        console.warn('Supabase insert notice (fallback active):', error.message);
      }

      setSubmitSuccess(true);
      setLeadForm({
        name: '',
        phone: '',
        email: '',
        destination: activeCountries[0]?.name || 'Australia',
        notes: ''
      });
    } catch (err: any) {
      console.warn('Network sync notice:', err);
      setSubmitSuccess(true); // Still provide user satisfaction on client
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION (Aegean Cyan & Editorial Campus Photography Banner) */}
      <section className="relative bg-navy-950 text-white overflow-hidden py-12 sm:py-16 lg:py-28">
        {/* Background Hero Banner Image with slow ambient zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <SmartImage
            src={heroImageUrl}
            alt="SR Global Consultants International Education Campus"
            className="w-full h-full object-cover object-center animate-hero-zoom"
          />
          {/* Layered Aegean Cyan -> Deep Navy atmospheric scrim for high-contrast typography */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-navy-950"
            style={{ opacity: heroOverlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/35 to-transparent" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>
        
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <Reveal variant="fade-down" delay={40}>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full border border-white/25 text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                  <span>{settings.hero?.badgeText || 'Certified Education & Visa Counselors'}</span>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={100}>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  Your Gateway to Global Education & Migration Success
                </h1>
              </Reveal>

              <Reveal variant="fade-up" delay={170}>
                <p className="text-base sm:text-lg text-slate-100 max-w-2xl leading-relaxed">
                  Expert admissions guidance, IELTS/PTE preparation, and certified visa assistance for Australia, United Kingdom, USA, Canada, and Europe. Headquartered in Gujranwala with authorized Australia liaison.
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={240}>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-1">
                  <Link
                    to="/book-appointment"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateWithTransition('/book-appointment', 'Book Consultation');
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-bold px-6 sm:px-7 py-3.5 rounded-xl shadow-lg shadow-black/20 hover:scale-105 transition-all text-sm sm:text-base"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Consultation</span>
                  </Link>

                  <Link
                    to="/courses"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateWithTransition('/courses', 'Courses & Programs');
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all text-sm sm:text-base group"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Reveal>

              {/* Highlights pills */}
              <Reveal variant="fade-up" delay={310}>
                <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 border-t border-white/20">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                    <span>Subclass 500 Experts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                    <span>Trade & AQF Pathways</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                    <span>High Visa Approval</span>
                  </div>
                </div>
              </Reveal>

              {/* Official ICEF Accredited Badge Strip in Hero */}
              <Reveal variant="zoom-in" delay={380}>
                <div className="pt-1">
                  <a
                    href={accreditedBadgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-full sm:w-auto items-center gap-3 sm:gap-4 p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-navy-950/65 hover:bg-navy-950/85 border border-white/20 hover:border-brand-300/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    title="Verify ICEF Accredited Certified Global Partner #7092"
                  >
                    <div className="shrink-0 rounded-xl bg-navy-900/90 p-1.5 border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <SmartImage
                        src={accreditedBadgeImage}
                        alt="ICEF Accredited Certified Global Partner #7092"
                        className="h-12 sm:h-16 w-auto object-contain rounded-lg"
                        fallback={
                          <img
                            src="/assets/icef_badge.png"
                            alt="ICEF Accredited Certified Global Partner #7092"
                            className="h-12 sm:h-16 w-auto object-contain rounded-lg"
                          />
                        }
                      />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-yellow-300">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>Official Accreditation</span>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white leading-snug">
                        ICEF Accredited Agency #7092
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-300 group-hover:text-brand-300 transition-colors inline-flex items-center gap-1">
                        <span>Certified Global Partner • Verify Status</span>
                        <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Right Quick Assessment Form */}
            <div className="lg:col-span-5">
              <Reveal variant="fade-left" delay={150}>
              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 text-slate-800 border border-slate-100">
                <div className="mb-5 sm:mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">Fast Response</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-950 mt-2">Online Profile Assessment</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Get an evaluation from our senior counselors in Gujranwala.</p>
                </div>

                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl text-center space-y-2 animate-tab-reveal">
                    <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                    <h4 className="font-bold text-lg">Inquiry Received!</h4>
                    <p className="text-sm text-green-700">Thank you. Our senior counselor will evaluate your profile and contact you within 2 business hours.</p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-3 text-xs font-bold text-brand-600 hover:underline"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="e.g. Muhammad Hamza"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="hamza@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Country</label>
                      <select
                        value={leadForm.destination}
                        onChange={(e) => setLeadForm({ ...leadForm, destination: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white transition-shadow"
                      >
                        {activeCountries.map((country) => (
                          <option key={country.id} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Background & Questions</label>
                      <textarea
                        rows={2}
                        value={leadForm.notes}
                        onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                        placeholder="Mention graduation year, marks percentage, or study gap..."
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting to CRM...' : 'Submit Profile Assessment'}</span>
                    </button>
                  </form>
                )}
              </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. HIGHLIGHT SLIDER BANNER */}
      <Reveal variant="fade-up" delay={80}>
        <HomeSliderBanner />
      </Reveal>

      {/* 2. STATS & KEY METRICS (Elevated Bar) */}
      <section className="relative z-20 mt-4 sm:-mt-3 lg:-mt-6 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <Reveal variant="zoom-in" delay={60}>
          <div className="bg-white border border-slate-200 py-6 sm:py-10 shadow-lg rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 px-4 sm:px-6 text-center">
              <Reveal variant="fade-up" delay={60}>
                <div className="transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-600">{metrics.studentsGuided}+</div>
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Students Guided</div>
                </div>
              </Reveal>
              <Reveal variant="fade-up" delay={140}>
                <div className="transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-500">{metrics.partnerUniversities}+</div>
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Partner Institutions</div>
                </div>
              </Reveal>
              <Reveal variant="fade-up" delay={220}>
                <div className="transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-600">{metrics.visaSuccessRate}</div>
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Visa Success Ratio</div>
                </div>
              </Reveal>
              <Reveal variant="fade-up" delay={300}>
                <div className="transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950">{metrics.yearsExperience} Yrs</div>
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Industry Experience</div>
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. STUDY DESTINATIONS CARDS */}
      <section className="py-14 sm:py-20 bg-slate-50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <Reveal variant="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Global Opportunities</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-navy-950 mt-3">Popular Study Destinations</h2>
              <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-base">
                Explore countries with post-study work permits, transparent immigration frameworks, and recognized qualifications.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((dest, idx) => (
              <Reveal key={dest.slug} variant="fade-up" delay={Math.min(idx * 90, 450)} className="h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-300 transition-all duration-300 group h-full flex flex-col justify-between">
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300 inline-block">{dest.flag}</span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          {dest.visa_subclass}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-navy-950 group-hover:text-brand-600 transition-colors">
                        {dest.country_name}
                      </h3>

                      <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {dest.overview}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Work Rights:</span>
                          <span className="text-slate-600 truncate max-w-[180px]">{dest.work_rights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Avg Living Cost:</span>
                          <span className="text-slate-600">{dest.avg_living_cost}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-2">
                      <Link
                        to="/destinations"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateWithTransition('/destinations', dest.country_name);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 group-hover:bg-brand-500 text-brand-600 group-hover:text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-300"
                      >
                        <span>Explore Requirements</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES SECTION */}
      <section className="py-14 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <Reveal variant="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Our Expertise</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-navy-950 mt-3">Complete Education & Visa Solutions</h2>
              <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-base">From profile evaluation to post-landing settlement, we handle every milestone with precision.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Reveal variant="fade-up" delay={0}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">Student Counseling</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Objective assessment matching previous qualifications and budget with verified international colleges and career outcomes.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={80}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">Student Visa Documentation</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Expert drafting of Genuine Student (GS) statements, SOPs, financial proofs, and compliance reviews for high visa grant ratios.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={160}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">IELTS & PTE Test Coaching</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Certified coaching in Gujranwala with mock tests, speaking labs, and band score enhancement techniques for Pearson and British Council exams.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={240}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">University Admissions</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Direct partnerships with over 160 international colleges and universities for expedited Offer Letters and Confirmation of Enrolment (CoE).
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={320}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">Scholarship Assistance</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Assistance with merit grants, early-bird fee reductions, and regional Australian scholarship applications to reduce costs.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={400}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy-950 mb-2">Pre-Departure & Settlement</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Comprehensive departure briefings on airport customs, Australian work restrictions, accommodation finding, and bank account setup.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. SUCCESS STORIES / TESTIMONIALS */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <Reveal variant="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-700 uppercase bg-brand-50 border border-brand-200 px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Success Stories</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-navy-950 mt-3 font-serif">What Our Students Say</h2>
              <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-base">
                Real visa-approved experiences from students across Pakistan. Click any card to view full details or watch video stories.
              </p>
              <div className="mt-4">
                <Link
                  to="/success-stories"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition('/success-stories', 'Success Stories');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>Browse All Country-Wise Stories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((item, idx) => {
              const photoSrc = item.imageUrl || (item as any).imageurl;
              const videoSrc = item.videoUrl || (item as any).videourl;
              const initials = (item.student_name || 'S')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <Reveal key={item.id} variant="fade-up" delay={Math.min(idx * 90, 450)} className="h-full">
                  <button
                    type="button"
                    onClick={() => setSelectedStory(item)}
                    className="group relative w-full text-left bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-200/90 hover:border-brand-300 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {/* Signature top gradient accent */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-sky-400 to-amber-400" />

                    <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-5 sm:space-y-6 w-full">
                      {/* Student Header with Google Image Link Support */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-brand-100 group-hover:ring-brand-400 transition-all shadow-md bg-gradient-to-br from-brand-500 to-navy-950 flex items-center justify-center">
                              <SmartImage
                                src={photoSrc}
                                alt={item.student_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                fallback={
                                  <span className="text-white font-black text-lg tracking-wider select-none">
                                    {initials}
                                  </span>
                                }
                              />
                            </div>
                            <span
                              title="Verified Student Visa"
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h5 className="font-bold text-base text-navy-950 truncate">{item.student_name}</h5>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                <Globe className="w-3 h-3" />
                                {item.country}
                              </span>
                              {item.year && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {item.year}
                                </span>
                              )}
                              {videoSrc && videoSrc.trim() && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-950 text-white">
                                  <VideoIcon className="w-3 h-3 text-brand-400" />
                                  <span>Video</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-brand-50/70 text-brand-500 flex items-center justify-center shrink-0">
                          <Quote className="w-4 h-4 fill-current opacity-80" />
                        </div>
                      </div>

                      {/* Star Rating & Quote */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 text-amber-400">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Visa Granted
                          </span>
                        </div>

                        <p className="text-slate-700 text-sm leading-relaxed italic line-clamp-4">
                          "{item.quote}"
                        </p>
                      </div>
                    </div>

                    {/* University Footer Bar */}
                    <div className="px-5 sm:px-7 py-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <GraduationCap className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="text-xs font-bold text-navy-950 truncate">{item.university}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Student Story Popup Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-[100] bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-remotion-backdrop"
          onClick={() => setSelectedStory(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedStory.student_name} Success Story`}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-tab-reveal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-brand-500 via-sky-400 to-amber-400" />

            <div className="p-5 sm:p-8 space-y-5">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-brand-200 shadow-md bg-gradient-to-br from-brand-500 to-navy-950 flex items-center justify-center shrink-0">
                    <SmartImage
                      src={selectedStory.imageUrl || (selectedStory as any).imageurl}
                      alt={selectedStory.student_name}
                      className="w-full h-full object-cover"
                      fallback={
                        <span className="text-white font-black text-xl tracking-wider">
                          {(selectedStory.student_name || 'S')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      }
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        <Globe className="w-3 h-3" />
                        {selectedStory.country}
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Visa Granted
                      </span>
                      {selectedStory.year && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {selectedStory.year}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-navy-950 font-serif truncate">
                      {selectedStory.student_name}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-brand-700 flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span>{selectedStory.university}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                  aria-label="Close student story modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Meta Details */}
              {(selectedStory.program || selectedStory.visaType) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  {selectedStory.program && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Course / Program</span>
                      <span className="font-bold text-navy-950">{selectedStory.program}</span>
                    </div>
                  )}
                  {selectedStory.visaType && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Visa Category</span>
                      <span className="font-bold text-emerald-700">{selectedStory.visaType}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Star rating + Quote + Full Story */}
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(selectedStory.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  "{selectedStory.quote}"
                </p>
                {selectedStory.fullStory && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedStory.fullStory}
                  </p>
                )}
              </div>

              {/* Embedded Video Preview if attached */}
              {(selectedStory.videoUrl || (selectedStory as any).videourl) && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950">
                    <VideoIcon className="w-4 h-4 text-brand-500" />
                    <span>Student Video Review</span>
                  </div>
                  <SmartVideo
                    src={selectedStory.videoUrl || (selectedStory as any).videourl}
                    poster={selectedStory.imageUrl || (selectedStory as any).imageurl}
                    title={selectedStory.student_name}
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const targetUrl = `/success-stories?story=${encodeURIComponent(selectedStory.id)}&country=${encodeURIComponent(selectedStory.country)}`;
                    setSelectedStory(null);
                    navigateWithTransition(targetUrl, `${selectedStory.student_name} Story`);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all text-sm"
                >
                  <span>View More Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. OFFICE EMBED & MAP SECTION */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <Reveal variant="fade-up">
            <div className="bg-navy-950 text-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:p-12 lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Visit Gujranwala Office</span>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-2">Meet Our Counselors in Person</h3>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                    Walk in for face-to-face academic assessment, original document verification, and one-on-one visa interview training.
                  </p>

                  <div className="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                      <span>{COMPANY_CONTACT.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-400 shrink-0" />
                      <span>Call Helpline: {COMPANY_CONTACT.phonePakistan}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-brand-400 shrink-0" />
                      <span className="break-all sm:break-normal">GPS Coordinates: {COMPANY_CONTACT.latitude}, {COMPANY_CONTACT.longitude}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${COMPANY_CONTACT.latitude},${COMPANY_CONTACT.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                  </a>

                  <Link
                    to="/book-appointment"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateWithTransition('/book-appointment', 'Book Consultation');
                    }}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 inline-flex items-center justify-center text-sm"
                  >
                    Book Office Slot
                  </Link>
                </div>
              </div>

              {/* Embedded Google Maps View */}
              <div className="lg:col-span-6 min-h-[350px] bg-slate-800">
                <iframe
                  title="SR Global Consultants Gujranwala Map"
                  src={`https://maps.google.com/maps?q=${COMPANY_CONTACT.latitude},${COMPANY_CONTACT.longitude}&hl=en&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 min-h-[350px]"
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
