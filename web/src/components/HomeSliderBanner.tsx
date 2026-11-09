import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';

interface Slide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  bgImage?: string;
}

const MOCK_SLIDES: Slide[] = [
  {
    id: 'australia',
    tag: 'AUSTRALIA SUBCLASS 500 & 485',
    title: 'Study & Settle in Australia with Expert Guidance',
    subtitle: 'Authorized admission & visa processing for AQF Trade, Vocational & University degrees. Direct Sydney & Melbourne liaison support.',
    highlight: 'Sydney • Melbourne • Brisbane • Perth',
    ctaText: 'Explore Australia Programs',
    ctaLink: '/destinations',
    gradient: 'from-navy-950 via-brand-700 to-brand-500'
  },
  {
    id: 'uk',
    tag: 'UK FAST-TRACK ADMISSIONS 2025/2026',
    title: 'Top UK University Masters & 2-Year Graduate Route',
    subtitle: 'Apply for upcoming intakes with generous scholarships up to £5,000 and post-study work authorization.',
    highlight: 'September & January Intakes Now Open',
    ctaText: 'Book UK Counseling',
    ctaLink: '/book-appointment',
    gradient: 'from-brand-700 via-brand-600 to-emerald-700'
  },
  {
    id: 'trade',
    tag: 'HIGH-DEMAND OCCUPATIONS & AQF',
    title: 'Commercial Cookery, Heavy Automotive & IT Diplomas',
    subtitle: 'Practical trade pathways leading to recognized Australian Qualification Framework (AQF) and Job Ready Programme readiness.',
    highlight: 'Fast Job Market Absorption & PR Pathways',
    ctaText: 'Browse Trade Courses',
    ctaLink: '/courses',
    gradient: 'from-navy-900 via-navy-800 to-brand-600'
  },
  {
    id: 'ielts-pte',
    tag: 'OFFICIAL TEST PREPARATION ACADEMY',
    title: 'IELTS & PTE Academic Coaching in Gujranwala',
    subtitle: 'High score achievement batches with computerized mock labs, diagnostic evaluation, and British Council certified instructors.',
    highlight: 'Guaranteed Band 7.0+ & PTE 65+ Training',
    ctaText: 'Register for Demo Class',
    ctaLink: '/book-appointment',
    gradient: 'from-emerald-800 via-emerald-700 to-navy-900'
  }
];

export const HomeSliderBanner: React.FC = () => {
  const { banners } = useLiveData();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Merge live banners with mock slides
  const activeSlides: Slide[] = banners.length > 0 
    ? banners.map(b => ({
        id: b.id,
        tag: 'SPECIAL ANNOUNCEMENT',
        title: b.title,
        subtitle: b.description,
        highlight: 'SR Global Consultants • Gujranwala',
        ctaText: 'Learn More',
        ctaLink: b.link || '/destinations',
        gradient: 'from-brand-600 via-brand-700 to-navy-950',
        bgImage: b.imageUrl
      }))
    : MOCK_SLIDES;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length]);

  const slide = activeSlides[current];

  if (!slide) return null;

  return (
    <div 
      className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 -mt-8 mb-12 relative z-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-3xl text-white shadow-2xl p-8 sm:p-12 transition-all duration-700 border border-white/10 min-h-[340px] flex items-center ${!slide.bgImage ? `bg-gradient-to-r ${slide.gradient}` : ''}`}>
        {/* Background Image if exists */}
        {(slide.bgImage || (slide as any).bgimage) && (
          <>
            <img 
              src={slide.bgImage || (slide as any).bgimage} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-85`} />
          </>
        )}

        {/* Background decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-yellow-300 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.tag}
              </span>
              <span className="text-xs text-white/70 font-mono">
                {current + 1} / {activeSlides.length}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {slide.title}
            </h2>

            <p className="text-sm sm:text-lg text-white/90 leading-relaxed max-w-2xl font-medium">
              {slide.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/25 backdrop-blur-sm text-xs font-bold text-yellow-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{slide.highlight}</span>
            </div>
          </div>

          {/* Action button & Carousel controls */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-5 shrink-0 w-full md:w-auto">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-black shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-base w-full sm:w-auto"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrent((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                className="p-3 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md transition-all text-white border border-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % activeSlides.length)}
                className="p-3 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md transition-all text-white border border-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current ? 'w-10 bg-yellow-400 shadow-sm' : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
