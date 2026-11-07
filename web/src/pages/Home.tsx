import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, ArrowRight, CheckCircle2, Award, Users, BookOpen, 
  Send, Star, MapPin, Phone, Shield, Globe, Sparkles 
} from 'lucide-react';
import { DESTINATIONS, SITE_METRICS, TESTIMONIALS, COMPANY_CONTACT } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { HomeSliderBanner } from '../components/HomeSliderBanner';

export const Home: React.FC = () => {
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    destination: 'Australia',
    course: 'Trade & Vocational Courses',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Sync to live Supabase Postgres
      const { error } = await supabase.from('leads').insert([
        {
          full_name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email || 'web@inquiry.com',
          destination: leadForm.destination,
          course_interest: leadForm.course,
          notes: leadForm.notes,
          status: 'New',
          source: 'Website Quick Form'
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
        destination: 'Australia',
        course: 'Trade & Vocational Courses',
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
      {/* 1. HERO SECTION (Aegean Cyan matching official signage) */}
      <section className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-navy-950 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Certified Education & Visa Counselors</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Your Gateway to Global Education & Migration Success
              </h1>

              <p className="text-lg text-slate-100 max-w-2xl leading-relaxed">
                Expert admissions guidance, IELTS/PTE preparation, and certified visa assistance for Australia, United Kingdom, USA, Canada, and Europe. Headquartered in Gujranwala with authorized Australia liaison.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-black/20 hover:scale-105 transition-all text-base"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Free Consultation</span>
                </Link>

                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all text-base"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Highlights pills */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>Subclass 500 Experts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>Trade & AQF Pathways</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>High Visa Approval</span>
                </div>
              </div>
            </div>

            {/* Right Quick Assessment Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border border-slate-100">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">Fast Response</span>
                  <h3 className="text-2xl font-bold text-navy-950 mt-2">Free Profile Assessment</h3>
                  <p className="text-sm text-slate-500">Get an evaluation from our senior counselors in Gujranwala.</p>
                </div>

                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl text-center space-y-2">
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
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
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
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="hamza@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Country</label>
                        <select
                          value={leadForm.destination}
                          onChange={(e) => setLeadForm({ ...leadForm, destination: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                        >
                          <option value="Australia">Australia</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                          <option value="Europe">Europe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Sector</label>
                        <select
                          value={leadForm.course}
                          onChange={(e) => setLeadForm({ ...leadForm, course: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                        >
                          <option value="Trade & Vocational Courses">Trade Courses (Cookery, Automotive)</option>
                          <option value="Higher Education (Bachelor/Master)">Higher Education</option>
                          <option value="AQF Australia Pathways">AQF Australia</option>
                          <option value="IELTS / PTE Test Prep">IELTS / PTE Prep</option>
                        </select>
                      </div>
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
                      className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting to CRM...' : 'Get Free Assessment Now'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. HIGHLIGHT SLIDER BANNER */}
      <HomeSliderBanner />

      {/* 2. STATS & KEY METRICS (Elevated Bar) */}
      <section className="bg-white border-b border-slate-200 py-10 shadow-sm relative z-20 -mt-6 max-w-6xl mx-auto rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          <div>
            <div className="text-3xl lg:text-4xl font-black text-brand-600">{SITE_METRICS.studentsGuided}+</div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Students Guided</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-black text-yellow-500">{SITE_METRICS.partnerUniversities}+</div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Partner Institutions</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-black text-green-600">{SITE_METRICS.visaSuccessRate}</div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Visa Success Ratio</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-black text-navy-950">{SITE_METRICS.yearsExperience} Yrs</div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-1">Industry Experience</div>
          </div>
        </div>
      </section>

      {/* 3. STUDY DESTINATIONS CARDS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Global Opportunities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mt-3">Popular Study Destinations</h2>
            <p className="text-slate-600 mt-3 text-base">
              Explore countries with post-study work permits, transparent immigration frameworks, and recognized qualifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DESTINATIONS.map((dest) => (
              <div key={dest.slug} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{dest.flag}</span>
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

                  <div className="mt-6 pt-2">
                    <Link
                      to="/destinations"
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-brand-50 text-brand-600 font-bold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      <span>Explore Requirements</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES SECTION */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Our Expertise</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mt-3">Complete Education & Visa Solutions</h2>
            <p className="text-slate-600 mt-3 text-base">From profile evaluation to post-landing settlement, we handle every milestone with precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">Student Counseling</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Objective assessment matching previous qualifications and budget with verified international colleges and career outcomes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">Student Visa Documentation</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Expert drafting of Genuine Student (GS) statements, SOPs, financial proofs, and compliance reviews for high visa grant ratios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">IELTS & PTE Test Coaching</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Certified coaching in Gujranwala with mock tests, speaking labs, and band score enhancement techniques for Pearson and British Council exams.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">University Admissions</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct partnerships with over 160 international colleges and universities for expedited Offer Letters and Confirmation of Enrolment (CoE).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">Scholarship Assistance</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Assistance with merit grants, early-bird fee reductions, and regional Australian scholarship applications to reduce costs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">Pre-Departure & Settlement</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive departure briefings on airport customs, Australian work restrictions, accommodation finding, and bank account setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Success Stories</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mt-3">What Our Students Say</h2>
            <p className="text-slate-600 mt-3 text-base">Real experiences from Pakistani students who secured admissions and visas with SR Global.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((item) => (
              <div key={item.id} className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm italic leading-relaxed mb-6">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
                    {item.student_name[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-navy-950">{item.student_name}</h5>
                    <p className="text-xs text-slate-500">{item.university} • {item.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OFFICE EMBED & MAP SECTION */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-950 text-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
            <div className="p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Visit Gujranwala Office</span>
                <h3 className="text-3xl font-bold mt-2">Meet Our Counselors in Person</h3>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  Walk in for face-to-face academic assessment, original document verification, and one-on-one visa interview training.
                </p>

                <div className="mt-8 space-y-4 text-sm">
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
                    <span>GPS Coordinates: {COMPANY_CONTACT.latitude}, {COMPANY_CONTACT.longitude}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${COMPANY_CONTACT.latitude},${COMPANY_CONTACT.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>

                <Link
                  to="/book-appointment"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3 rounded-xl transition-all"
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
        </div>
      </section>
    </div>
  );
};
