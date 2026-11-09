import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Users, Globe2, Compass, CheckCircle, ArrowRight } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const About: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">About SR Global</span>
          <h1 className="text-4xl sm:text-5xl font-black text-navy-950 mt-4 font-serif">
            Empowering Pakistani Students to Excel Worldwide
          </h1>
          <p className="text-slate-600 mt-4 text-base leading-relaxed">
            Founded with a vision of transparent, ethical, and high-standard foreign education counseling, SR Global Consultants has guided over 5,200 ambitious candidates to Australia, the UK, the USA, Canada, and Europe.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-navy-950 mb-3">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              To eliminate misinformation in the migration sector by providing authentic educational pathway consultations, transparent fee structures, and personalized SOP and visa application guidance that ensures lawful and rewarding career progression.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-navy-950 mb-3">Our Global Footprint</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Headquartered in Gujranwala's commercial hub at Civic Center, complemented by direct liaison channels in Australia, we ensure continuous student support from initial course selection to overseas airport reception and post-study settlement.
            </p>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Why Choose SR Global</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Unrivaled Standard of Counseling</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300"><strong>Specialized Australian Trade Course Expertise:</strong> Commercial Cookery, Automotive, and Carpentry pathways aligned with current Australian occupation demand lists.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300"><strong>Zero Hidden Charges:</strong> Complete institutional fee disclosures, direct fee transfers to colleges, and authentic documentation.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300"><strong>High Grant Ratios:</strong> Over 98.4% visa success rate through meticulous preparation of Genuine Student (GS) Statements and financial file reviews.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300"><strong>In-House Test Preparation:</strong> Daily IELTS and PTE labs with structured mock scoring in our Gujranwala classrooms.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-brand-500 rounded-3xl p-10 text-center text-white shadow-lg">
          <h3 className="text-3xl font-bold mb-3">Ready to Discuss Your Future?</h3>
          <p className="text-brand-100 max-w-xl mx-auto mb-6 text-sm">
            Schedule a free counseling session at our Gujranwala office or connect online with our Australia branch.
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 bg-white text-navy-950 hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl shadow-md transition-all"
          >
            <span>Book Your Appointment Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
