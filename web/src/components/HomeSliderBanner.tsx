import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface Slide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
}

const SLIDES: Slide[] = [
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
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[current];

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12 relative z-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.gradient} text-white shadow-2xl p-6 sm:p-10 transition-all duration-700 border border-white/10`}>
        {/* Background decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-yellow-300 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.tag}
              </span>
              <span className="text-xs text-white/70 font-mono">
                {current + 1} / {SLIDES.length}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
              {slide.title}
            </h2>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
              {slide.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/25 backdrop-blur-sm text-xs font-semibold text-yellow-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{slide.highlight}</span>
            </div>
          </div>

          {/* Action button & Carousel controls */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-4 shrink-0">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-navy-950 font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
                className="p-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm transition-colors text-white"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
                className="p-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm transition-colors text-white"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-2 pt-6">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
