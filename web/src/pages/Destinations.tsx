import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, CheckCircle2, DollarSign, Briefcase, GraduationCap, Calendar, ChevronRight } from 'lucide-react';
import { Destination } from '../types';
import { useLiveData } from '../context/LiveDataContext';

export const Destinations: React.FC = () => {
  const { destinations } = useLiveData();
  const [activeTab, setActiveTab] = useState<string>(destinations[0]?.slug || 'australia');

  const activeDestination: Destination =
    destinations.find((d) => d.slug === activeTab) || destinations[0] || ({} as Destination);

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Global Higher Education</span>
          <h1 className="text-4xl font-black text-navy-950 mt-3 font-serif">Study Destinations Guide</h1>
          <p className="text-slate-600 mt-3 text-base">
            Detailed information on admission criteria, student visa subclasses, cost of living, and work rights for top international education destinations.
          </p>
        </div>

        {/* Destination Country Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {destinations.map((dest) => (
            <button
              key={dest.slug}
              onClick={() => setActiveTab(dest.slug)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                activeTab === dest.slug
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-2xl">{dest.flag}</span>
              <span>{dest.country_name}</span>
            </button>
          ))}
        </div>

        {/* Active Destination Detail Pane */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Banner */}
          <div className={`p-8 sm:p-12 border-b-4 border-brand-500 relative ${!activeDestination.imageUrl ? 'bg-navy-950 text-white' : ''}`}>
            {activeDestination.imageUrl && (
              <img src={activeDestination.imageUrl} alt={activeDestination.country_name} className="absolute inset-0 w-full h-full object-cover brightness-50" />
            )}
            <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{activeDestination.flag}</span>
                <div>
                  <div className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-md uppercase tracking-wider mb-2">
                    {activeDestination.visa_subclass}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black">{activeDestination.country_name}</h2>
                  <p className="text-slate-200 text-sm mt-1">Capital: {activeDestination.capital} • Currency: {activeDestination.currency}</p>
                </div>
              </div>

              <Link
                to="/book-appointment"
                className="bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Apply for {activeDestination.country_name}</span>
              </Link>
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-10">
            {/* Overview */}
            <div>
              <h3 className="text-2xl font-bold text-navy-950 mb-3">Country Overview</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                {activeDestination.overview}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-brand-600" />
                  <h4 className="font-bold text-base text-navy-950">Work Regulations</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeDestination.work_rights}
                </p>
              </div>

              <div className="bg-yellow-50/70 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-bold text-base text-navy-950">Average Living Expenses</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeDestination.avg_living_cost}
                </p>
              </div>
            </div>

            {/* Visa Process Roadmap */}
            <div>
              <h3 className="text-2xl font-bold text-navy-950 mb-6">Step-by-Step Visa Procedure</h3>
              <div className="space-y-4">
                {activeDestination.visa_process.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-8 h-8 rounded-full bg-brand-500 text-white font-black flex items-center justify-center shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-slate-800 text-sm pt-1 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Requirements & Universities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-xl font-bold text-navy-950 mb-3">Admission Criteria</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeDestination.admission_requirements}
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold text-navy-950 mb-3">Top Universities & Colleges</h4>
                <ul className="space-y-2">
                  {activeDestination.top_universities.map((uni, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <GraduationCap className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{uni}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
