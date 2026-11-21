import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Compass, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { usePageTransition } from '../components/PageTransition';
import { useSiteSettings } from '../context/SettingsContext';
import { SmartImage } from '../components/SmartImage';
import { SmartVideo } from '../components/SmartVideo';
import { AboutCustomCard } from '../types';

export const About: React.FC = () => {
  const { navigateWithTransition } = usePageTransition();
  const { settings } = useSiteSettings();
  const aboutConfig = settings.about;
  const customCards = [...(aboutConfig?.customCards || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const pillars = [
    {
      title: 'Specialized Australian Trade Course Expertise:',
      desc: 'Commercial Cookery, Automotive, and Carpentry pathways aligned with current Australian occupation demand lists.',
    },
    {
      title: 'Zero Hidden Charges:',
      desc: 'Complete institutional fee disclosures, direct fee transfers to colleges, and authentic documentation.',
    },
    {
      title: 'High Grant Ratios:',
      desc: 'Over 98.4% visa success rate through meticulous preparation of Genuine Student (GS) Statements and financial file reviews.',
    },
    {
      title: 'In-House Test Preparation:',
      desc: 'Daily IELTS and PTE labs with structured mock scoring in our Gujranwala classrooms.',
    },
  ];

  const getThemeClasses = (theme: AboutCustomCard['theme']) => {
    switch (theme) {
      case 'navy':
        return {
          card: 'bg-navy-950 text-white border-navy-800',
          badge: 'bg-brand-500/20 text-brand-300 border border-brand-400/30',
          title: 'text-white',
          subtitle: 'text-brand-300',
          desc: 'text-slate-300',
          highlightIcon: 'text-emerald-400',
          highlightText: 'text-slate-200',
          cta: 'bg-yellow-400 hover:bg-yellow-300 text-navy-950',
        };
      case 'brand':
        return {
          card: 'bg-gradient-to-br from-brand-600 to-brand-700 text-white border-brand-500',
          badge: 'bg-white/20 text-white border border-white/25',
          title: 'text-white',
          subtitle: 'text-sky-100',
          desc: 'text-sky-50',
          highlightIcon: 'text-yellow-300',
          highlightText: 'text-white',
          cta: 'bg-white hover:bg-slate-100 text-navy-950',
        };
      default:
        return {
          card: 'bg-white text-slate-800 border-slate-200',
          badge: 'bg-brand-50 text-brand-700 border border-brand-200',
          title: 'text-navy-950',
          subtitle: 'text-brand-600',
          desc: 'text-slate-600',
          highlightIcon: 'text-emerald-500',
          highlightText: 'text-slate-700',
          cta: 'bg-brand-500 hover:bg-brand-600 text-white',
        };
    }
  };

  const renderMedia = (card: AboutCustomCard) => {
    if (!card.showMedia || card.mediaType === 'none' || !card.mediaUrl?.trim()) return null;

    if (card.mediaType === 'video') {
      return (
        <SmartVideo
          src={card.mediaUrl}
          title={card.title || 'About Showcase Video'}
          aspectClassName="aspect-video"
        />
      );
    }

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-black/10 shadow-md bg-slate-100 aspect-[16/10]">
        <SmartImage
          src={card.mediaUrl}
          alt={card.title || 'SR Global Showcase'}
          className="w-full h-full object-cover"
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              Image unavailable
            </div>
          }
        />
      </div>
    );
  };

  const renderCardCta = (card: AboutCustomCard, ctaClass: string) => {
    if (!card.showCta || !card.ctaLabel?.trim() || !card.ctaLink?.trim()) return null;
    const isExternal = /^https?:\/\//i.test(card.ctaLink.trim());
    if (isExternal) {
      return (
        <a
          href={card.ctaLink.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm ${ctaClass}`}
        >
          <span>{card.ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      );
    }

    return (
      <Link
        to={card.ctaLink.trim()}
        onClick={(e) => {
          e.preventDefault();
          navigateWithTransition(card.ctaLink!.trim(), card.ctaLabel);
        }}
        className={`inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm ${ctaClass}`}
      >
        <span>{card.ctaLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  };

  return (
    <div className="py-10 sm:py-16 bg-slate-50">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <Reveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">
              {aboutConfig?.heroEyebrow || 'About SR Global'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-navy-950 mt-4 font-serif">
              {aboutConfig?.heroTitle || 'Empowering Pakistani Students to Excel Worldwide'}
            </h1>
            <p className="text-slate-600 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
              {aboutConfig?.heroDescription ||
                'Founded with a vision of transparent, ethical, and high-standard foreign education counseling, SR Global Consultants has guided over 5,200 ambitious candidates to Australia, the UK, the USA, Canada, and Europe.'}
            </p>
          </div>
        </Reveal>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-16">
          <Reveal variant="fade-right" delay={60} className="h-full">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-300 transition-all duration-300 group h-full">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-navy-950 mb-3">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                To eliminate misinformation in the migration sector by providing authentic educational pathway consultations, transparent fee structures, and personalized SOP and visa application guidance that ensures lawful and rewarding career progression.
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-left" delay={140} className="h-full">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-300 transition-all duration-300 group h-full">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-navy-950 mb-3">Our Global Footprint</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Headquartered in Gujranwala's commercial hub at Civic Center, complemented by direct liaison channels in Australia, we ensure continuous student support from initial course selection to overseas airport reception and post-study settlement.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Dynamic Admin-Configured Cards & Media Sections (Supports Drag & Drop Order, Google Drive Images/Videos, Custom Fields) */}
        {customCards.length > 0 && (
          <div className="mb-10 sm:mb-16 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {customCards.map((card, idx) => {
                const styles = getThemeClasses(card.theme);
                const mediaEl = renderMedia(card);
                const isWide = card.layout !== 'compact';
                const highlights = (card.highlights || []).filter((h) => h.trim().length > 0);

                return (
                  <Reveal
                    key={card.id}
                    variant="fade-up"
                    delay={Math.min(idx * 80, 320)}
                    className={isWide ? 'md:col-span-2' : 'h-full'}
                  >
                    <div
                      className={`rounded-3xl p-6 sm:p-8 border shadow-sm hover:shadow-xl transition-all duration-300 h-full ${styles.card}`}
                    >
                      {card.layout === 'split' && mediaEl ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                          <div className="lg:col-span-6 space-y-4">
                            {card.showBadge && card.badge && (
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${styles.badge}`}>
                                <Sparkles className="w-3 h-3" />
                                <span>{card.badge}</span>
                              </span>
                            )}
                            {card.showTitle && card.title && (
                              <h2 className={`text-2xl sm:text-3xl font-black font-serif leading-tight ${styles.title}`}>
                                {card.title}
                              </h2>
                            )}
                            {card.showSubtitle && card.subtitle && (
                              <p className={`text-sm font-bold ${styles.subtitle}`}>{card.subtitle}</p>
                            )}
                            {card.showDescription && card.description && (
                              <p className={`text-sm leading-relaxed whitespace-pre-line ${styles.desc}`}>
                                {card.description}
                              </p>
                            )}
                            {card.showHighlights && highlights.length > 0 && (
                              <ul className="space-y-2 pt-1">
                                {highlights.map((hl, i) => (
                                  <li key={i} className={`flex items-start gap-2 text-xs sm:text-sm ${styles.highlightText}`}>
                                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${styles.highlightIcon}`} />
                                    <span>{hl}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {renderCardCta(card, styles.cta)}
                          </div>
                          <div className="lg:col-span-6">{mediaEl}</div>
                        </div>
                      ) : (
                        <div className="space-y-4 flex flex-col justify-between h-full">
                          <div className="space-y-4">
                            {card.showBadge && card.badge && (
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${styles.badge}`}>
                                <Sparkles className="w-3 h-3" />
                                <span>{card.badge}</span>
                              </span>
                            )}
                            {card.showTitle && card.title && (
                              <h2 className={`text-xl sm:text-2xl font-black font-serif leading-tight ${styles.title}`}>
                                {card.title}
                              </h2>
                            )}
                            {card.showSubtitle && card.subtitle && (
                              <p className={`text-xs sm:text-sm font-bold ${styles.subtitle}`}>{card.subtitle}</p>
                            )}
                            {mediaEl}
                            {card.showDescription && card.description && (
                              <p className={`text-sm leading-relaxed whitespace-pre-line ${styles.desc}`}>
                                {card.description}
                              </p>
                            )}
                            {card.showHighlights && highlights.length > 0 && (
                              <ul className="space-y-2 pt-1">
                                {highlights.map((hl, i) => (
                                  <li key={i} className={`flex items-start gap-2 text-xs sm:text-sm ${styles.highlightText}`}>
                                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${styles.highlightIcon}`} />
                                    <span>{hl}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {renderCardCta(card, styles.cta) && <div className="pt-2">{renderCardCta(card, styles.cta)}</div>}
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}

        {/* What Sets Us Apart */}
        <Reveal variant="fade-up" delay={100}>
          <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-12 mb-10 sm:mb-16 shadow-xl">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Why Choose SR Global</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-6">Unrivaled Standard of Counseling</h2>
              <div className="space-y-4">
                {pillars.map((item, idx) => (
                  <Reveal key={item.title} variant="fade-up" delay={idx * 90}>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">
                        <strong className="text-white">{item.title}</strong> {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA Box */}
        <Reveal variant="zoom-in" delay={120}>
          <div className="bg-brand-500 rounded-3xl p-6 sm:p-10 text-center text-white shadow-lg hover:shadow-2xl transition-shadow">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Discuss Your Future?</h3>
            <p className="text-brand-100 max-w-xl mx-auto mb-6 text-sm">
              Schedule a counseling session at our Gujranwala office or connect online with our Australia branch.
            </p>
            <Link
              to="/book-appointment"
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/book-appointment', 'Book Consultation');
              }}
              className="inline-flex items-center gap-2 bg-white text-navy-950 hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl shadow-md hover:scale-105 transition-all group"
            >
              <span>Book Your Appointment Today</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
