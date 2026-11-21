import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  Calendar,
  CheckCircle2,
  Filter,
  Globe,
  GraduationCap,
  Layers,
  LayoutGrid,
  Quote,
  Search,
  Sparkles,
  Star,
  Video as VideoIcon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import { Testimonial } from '../types';
import { SmartImage } from '../components/SmartImage';
import { SmartVideo } from '../components/SmartVideo';
import { Reveal } from '../components/Reveal';
import { usePageTransition } from '../components/PageTransition';

export const SuccessStories: React.FC = () => {
  const { testimonials } = useLiveData();
  const location = useLocation();
  const { navigateWithTransition } = usePageTransition();

  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByCountry, setGroupByCountry] = useState(true);
  const [highlightedStoryId, setHighlightedStoryId] = useState<string | null>(null);

  // Sync URL query params (?story=<id>&country=<name>) on navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const storyId = params.get('story');
    const countryParam = params.get('country');

    if (countryParam) {
      setSelectedCountry(countryParam);
    }

    if (storyId) {
      setHighlightedStoryId(storyId);
      const matched = testimonials.find((t) => t.id === storyId);
      if (matched && !countryParam) {
        // Keep All or jump directly to that country so card is guaranteed visible
        setSelectedCountry(matched.country || 'All');
      }

      const timer = window.setTimeout(() => {
        const el = document.getElementById(`story-${storyId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 280);
      return () => window.clearTimeout(timer);
    }
  }, [location.search, testimonials]);

  // Distinct countries with story counts
  const countryTabs = useMemo(() => {
    const counts = new Map<string, number>();
    testimonials.forEach((t) => {
      const country = (t.country || 'International').trim();
      counts.set(country, (counts.get(country) || 0) + 1);
    });
    return [
      { name: 'All', count: testimonials.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, [testimonials]);

  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return testimonials.filter((t) => {
      const countryMatch =
        selectedCountry === 'All' ||
        (t.country || '').trim().toLowerCase() === selectedCountry.trim().toLowerCase();
      if (!countryMatch) return false;
      if (!q) return true;
      return (
        (t.student_name || '').toLowerCase().includes(q) ||
        (t.university || '').toLowerCase().includes(q) ||
        (t.country || '').toLowerCase().includes(q) ||
        (t.program || '').toLowerCase().includes(q) ||
        (t.visaType || '').toLowerCase().includes(q) ||
        (t.quote || '').toLowerCase().includes(q)
      );
    });
  }, [testimonials, selectedCountry, searchQuery]);

  const groupedByCountry = useMemo(() => {
    const groups = new Map<string, Testimonial[]>();
    filteredStories.forEach((story) => {
      const c = (story.country || 'International').trim();
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c)!.push(story);
    });
    return Array.from(groups.entries());
  }, [filteredStories]);

  const videoCount = useMemo(
    () => testimonials.filter((t) => Boolean(t.videoUrl && t.videoUrl.trim())).length,
    [testimonials]
  );

  const renderStoryCard = (story: Testimonial, idx: number) => {
    const photoSrc = story.imageUrl || (story as any).imageurl;
    const videoSrc = story.videoUrl || (story as any).videourl;
    const isHighlighted = highlightedStoryId === story.id;
    const initials = (story.student_name || 'S')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <Reveal key={story.id} variant="fade-up" delay={Math.min(idx * 70, 350)}>
        <article
          id={`story-${story.id}`}
          className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
            isHighlighted
              ? 'border-brand-500 ring-4 ring-brand-400/35 shadow-2xl'
              : 'border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-xl'
          }`}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-sky-400 to-amber-400" />

          <div className="p-5 sm:p-7 space-y-5 flex-1 flex flex-col">
            {/* Student Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-2 ring-brand-100 shadow-md bg-gradient-to-br from-brand-500 to-navy-950 flex items-center justify-center">
                    <SmartImage
                      src={photoSrc}
                      alt={story.student_name}
                      className="w-full h-full object-cover"
                      fallback={
                        <span className="text-white font-black text-lg tracking-wider select-none">
                          {initials}
                        </span>
                      }
                    />
                  </div>
                  <span
                    title="Verified Visa Approval"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold text-lg text-navy-950 truncate">{story.student_name}</h3>
                    {isHighlighted && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        Selected Story
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      <Globe className="w-3 h-3" />
                      {story.country}
                    </span>
                    {story.year && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Intake {story.year}
                      </span>
                    )}
                    {story.visaType && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {story.visaType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-0.5 text-amber-400 shrink-0">
                {[...Array(story.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            {/* University & Program Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <GraduationCap className="w-4 h-4 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase text-slate-400">University / College</div>
                  <div className="font-bold text-navy-950 truncate">{story.university}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Course / Pathway</div>
                  <div className="font-bold text-navy-950 truncate">
                    {story.program || 'International Degree / Visa Pathway'}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Testimonial Quote & Detailed Story */}
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-2.5">
                <Quote className="w-5 h-5 text-brand-400 shrink-0 mt-0.5 opacity-80" />
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>
              {story.fullStory && story.fullStory.trim() && (
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-brand-50/40 border border-brand-100 rounded-2xl p-4 whitespace-pre-line">
                  {story.fullStory}
                </div>
              )}
            </div>

            {/* Interactive Student Video Player (Google Drive or MP4) */}
            {videoSrc && videoSrc.trim() && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-navy-950">
                    <VideoIcon className="w-4 h-4 text-brand-500" />
                    <span>Student Video Testimonial</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Tap to Play / Pause
                  </span>
                </div>
                <SmartVideo
                  src={videoSrc}
                  poster={photoSrc}
                  title={`${story.student_name} - ${story.country} Success Story`}
                />
              </div>
            )}
          </div>
        </article>
      </Reveal>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Page Hero */}
      <section className="relative bg-navy-950 text-white py-12 sm:py-16 overflow-hidden border-b-4 border-brand-500">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <Reveal variant="fade-up">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Verified Visa Grants & Video Testimonials</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
                Student Success Stories
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore real visa-approved student journeys organized country-wise, complete with university placements, detailed case notes, and student video reviews.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{testimonials.length} Verified Stories</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl font-semibold">
                  <Globe className="w-4 h-4 text-brand-400" />
                  <span>{Math.max(countryTabs.length - 1, 1)} Countries</span>
                </div>
                {videoCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl font-semibold">
                    <VideoIcon className="w-4 h-4 text-amber-300" />
                    <span>{videoCount} Video Reviews</span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Country Filter & Search Toolbar */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Country Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span>Country:</span>
              </span>
              {countryTabs.map((tab) => {
                const active = selectedCountry.toLowerCase() === tab.name.toLowerCase();
                return (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(tab.name);
                      setHighlightedStoryId(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      active
                        ? 'bg-navy-950 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-brand-500 text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & View Mode Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, uni, visa..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setGroupByCountry((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                  groupByCountry
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Toggle Country-Wise Grouping"
              >
                {groupByCountry ? <Layers className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{groupByCountry ? 'Country Sections' : 'Grid View'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 sm:pt-12 space-y-12">
        {filteredStories.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-4">
            <Globe className="w-10 h-10 text-brand-400 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-navy-950">No Matching Stories Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search filter or switching to All Countries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCountry('All');
                setSearchQuery('');
              }}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
            >
              Show All Countries
            </button>
          </div>
        ) : groupByCountry ? (
          <div className="space-y-12">
            {groupedByCountry.map(([countryName, items]) => (
              <section key={countryName} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
                      <Globe className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-navy-950 font-serif">
                        {countryName} Success Stories
                      </h2>
                      <p className="text-xs text-slate-500">
                        {items.length} verified student {items.length === 1 ? 'case' : 'cases'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {items.map((story, idx) => renderStoryCard(story, idx))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredStories.map((story, idx) => renderStoryCard(story, idx))}
          </div>
        )}

        {/* Bottom CTA */}
        <Reveal variant="zoom-in">
          <div className="bg-gradient-to-r from-navy-950 via-[#0d2240] to-brand-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                Start Your Application Journey
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif">
                Want to Feature in Our Next Visa Approvals?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Schedule a one-on-one counseling session with our certified team for course selection, Genuine Student (GS) file review, and visa filing.
              </p>
            </div>
            <Link
              to="/book-appointment"
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/book-appointment', 'Book Consultation');
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 shrink-0 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
