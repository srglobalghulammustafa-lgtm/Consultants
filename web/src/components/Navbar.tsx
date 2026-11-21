import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Menu,
  X,
  Bell,
  Volume2,
  Sparkles,
  ExternalLink,
  Home,
  Info,
  GraduationCap,
  Globe,
  Search,
  ChevronRight,
  Navigation,
  Award
} from 'lucide-react';
import { Lottie } from 'lottie-react';
import { useSiteSettings } from '../context/SettingsContext';
import { playPremiumChime } from '../lib/audio';
import { usePageTransition } from './PageTransition';
import { SmartImage } from './SmartImage';
import { SR_TRANSITION_LOTTIE } from '../lib/transitionLottie';

const getNavItemMeta = (path: string) => {
  switch (path) {
    case '/':
      return { icon: Home, subtitle: 'Overview & profile assessment' };
    case '/about':
      return { icon: Info, subtitle: 'Certified counselors & vision' };
    case '/courses':
      return { icon: GraduationCap, subtitle: 'Trade courses & degree pathways' };
    case '/destinations':
      return { icon: Globe, subtitle: 'Australia, UK, USA, Canada & EU' };
    case '/success-stories':
      return { icon: Award, subtitle: 'Country-wise visas & student videos' };
    case '/track-appointment':
      return { icon: Search, subtitle: 'Check appointment ID live' };
    case '/contact':
      return { icon: MapPin, subtitle: 'Gujranwala & Australia offices' };
    default:
      return { icon: Navigation, subtitle: 'Explore page details' };
  }
};

export const Navbar: React.FC = () => {
  const { navigateWithTransition } = usePageTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);
  const [lastChimedId, setLastChimedId] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const desktopBellRef = useRef<HTMLButtonElement>(null);
  const mobileBellRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        desktopBellRef.current?.contains(target) ||
        mobileBellRef.current?.contains(target)
      ) {
        return;
      }
      setShowBellDropdown(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const location = useLocation();
  const { settings } = useSiteSettings();
  const header = settings.header;
  const activeBroadcast = settings.activeBroadcast;
  const broadcastHistory = settings.broadcastHistory || [];

  // Close menus & reveal header on route change
  useEffect(() => {
    setIsOpen(false);
    setShowBellDropdown(false);
    setIsHeaderVisible(true);
    lastScrollYRef.current = Math.max(window.scrollY || 0, 0);
  }, [location.pathname]);

  // Complete scroll-hide logic: hide header smoothly when scrolling down, reveal on scroll up or near top
  useEffect(() => {
    if (isOpen || showBellDropdown) {
      setIsHeaderVisible(true);
    }

    const updateHeaderVisibility = () => {
      const currentScrollY = Math.max(window.scrollY || window.pageYOffset || 0, 0);

      if (isOpen || showBellDropdown) {
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
        return;
      }

      if (currentScrollY <= 72) {
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
        return;
      }

      const delta = currentScrollY - lastScrollYRef.current;
      if (Math.abs(delta) >= 8) {
        if (delta > 0 && currentScrollY > 96) {
          setIsHeaderVisible(false);
        } else if (delta < 0) {
          setIsHeaderVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
      }

      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(updateHeaderVisibility);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, showBellDropdown]);

  const handleHeaderNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    label?: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setIsOpen(false);
    setShowBellDropdown(false);
    navigateWithTransition(path, label);
  };

  // Play audio chime when a new urgent or sound-enabled broadcast arrives
  useEffect(() => {
    if (activeBroadcast && activeBroadcast.id !== lastChimedId) {
      if (activeBroadcast.playSound || activeBroadcast.priority === 'Urgent') {
        playPremiumChime();
      }
      setLastChimedId(activeBroadcast.id);
    }
  }, [activeBroadcast, lastChimedId]);

  const navLinks = header.navLinks && header.navLinks.length > 0
    ? header.navLinks.filter((l) => l.isVisible)
    : [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Courses & Programs', path: '/courses' },
        { name: 'Study Destinations', path: '/destinations' },
        { name: 'Success Stories', path: '/success-stories' },
        { name: 'Track Status', path: '/track-appointment' },
        { name: 'Contact Office', path: '/contact' }
      ];

  const hasActiveBroadcast = activeBroadcast && activeBroadcast.id !== dismissedBannerId;

  const toggleBell = () => {
    setIsOpen(false);
    setIsHeaderVisible(true);
    setShowBellDropdown((prev) => {
      const next = !prev;
      if (next) playPremiumChime();
      return next;
    });
  };

  // Lock body scroll & wire Escape / desktop resize cleanup when mobile slider is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return (
    <>
    <header
      className={`sticky top-0 z-50 w-full bg-navy-950 text-white shadow-xl shadow-navy-950/30 transition-transform duration-300 ease-out will-change-transform ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Broadcast Announcement Header Banner (if broadcast active) */}
      {hasActiveBroadcast && (
        <div
          className={`text-white text-xs py-2 px-3 sm:px-6 transition-all ${
            activeBroadcast.priority === 'Urgent'
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600'
              : 'bg-gradient-to-r from-brand-700 via-navy-900 to-brand-800'
          }`}
        >
          <div className="max-w-[98%] xl:max-w-[96%] mx-auto flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1 bg-white/20 rounded-full shrink-0">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              </span>
              <div className="truncate text-[11px] sm:text-xs">
                <strong className="font-bold mr-1.5 uppercase tracking-wide bg-white/20 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">
                  {activeBroadcast.priority === 'Urgent' ? 'URGENT' : 'UPDATE'}
                </strong>
                <span className="font-semibold text-slate-100">{activeBroadcast.title}:</span>{' '}
                <span className="text-slate-200">{activeBroadcast.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {activeBroadcast.link && (
                <a
                  href={activeBroadcast.link}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setDismissedBannerId(activeBroadcast.id)}
                className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10"
                aria-label="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Contact / Utility Strip */}
      <div className="bg-slate-950/60 text-slate-200 text-[11px] sm:text-xs py-1.5 sm:py-2 px-4 sm:px-6 lg:px-10 border-b border-white/10">
        <div className="max-w-[1536px] mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{header.topAnnouncement || header.address}</span>
            </span>
            <span className="hidden md:flex items-center gap-1 shrink-0">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              {header.email}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${header.phonePakistan}`}
              className="flex items-center gap-1 hover:text-brand-300 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
              <span className="hidden xs:inline">PK:</span> {header.phonePakistan}
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a
              href={`tel:${header.phoneAustralia}`}
              className="hidden sm:flex items-center gap-1 hover:text-brand-300 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              AU: {header.phoneAustralia}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="relative max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2">
          {/* Official Transparent Brand Logo */}
          <Link
            to="/"
            onClick={(e) => handleHeaderNavClick(e, '/', 'Home')}
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink-0"
          >
            <SmartImage
              src={header.logoUrl || '/logo.png'}
              alt="SR Global Consultants Logo"
              className="h-11 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-[0_2px_10px_rgba(0,159,227,0.35)]"
              fallback={
                <img
                  src="/logo.png"
                  alt="SR Global Consultants Logo"
                  className="h-11 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform shrink-0 drop-shadow-[0_2px_10px_rgba(0,159,227,0.35)]"
                />
              }
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-lg sm:text-xl text-white tracking-wider whitespace-nowrap">
                  SR GLOBAL
                </span>
                <span className="hidden sm:inline-block bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                  Pakistan • Australia
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-brand-400 uppercase leading-tight">
                — CONSULTANTS —
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleHeaderNavClick(e, link.path, link.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-brand-300 bg-white/10 border border-brand-400/30 font-bold shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Bar */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              ref={desktopBellRef}
              type="button"
              onClick={toggleBell}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors border border-white/15"
              title="View Broadcast Notifications"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {broadcastHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-navy-950">
                  {broadcastHistory.length}
                </span>
              )}
            </button>

            <Link
              to="/book-appointment"
              onClick={(e) => handleHeaderNavClick(e, '/book-appointment', 'Book Consultation')}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile & Tablet Action Controls (< lg) */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <Link
              to="/book-appointment"
              onClick={(e) => handleHeaderNavClick(e, '/book-appointment', 'Book Consultation')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </Link>

            <button
              ref={mobileBellRef}
              type="button"
              onClick={toggleBell}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 relative transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {broadcastHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-navy-950">
                  {broadcastHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowBellDropdown(false);
                setIsHeaderVisible(true);
                setIsOpen((prev) => !prev);
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Shared Responsive Notification Bell Popover (Works on Mobile & Desktop) */}
        {showBellDropdown && (
          <div
            ref={popoverRef}
            className="absolute left-3 right-3 sm:left-auto sm:right-6 lg:right-10 top-full mt-2 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-tab-reveal"
          >
            <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <h4 className="font-bold text-navy-950 text-sm">Notifications & Updates</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => playPremiumChime()}
                  className="text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-slate-100"
                  title="Play Audio Chime"
                  aria-label="Play audio chime"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBellDropdown(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
              {broadcastHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No broadcast notifications yet.
                </div>
              ) : (
                broadcastHistory.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-brand-100 text-brand-800'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <h5 className="font-semibold text-navy-950 text-xs mb-1">{item.title}</h5>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.message}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        onClick={() => setShowBellDropdown(false)}
                        className="mt-2 text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                      >
                        Open Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Signature Aegean Cyan & Amber gradient accent strip */}
      <div className="h-[2px] w-full bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500 shadow-sm" />
    </header>

    {/* Mobile Lottie + Remotion Slide-Over Navigation Drawer (Rendered outside transformed header) */}
    {isOpen && (
      <div className="lg:hidden fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        {/* Frosted backdrop */}
        <div
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-md animate-remotion-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Kinetic Panel */}
        <aside className="fixed top-0 right-0 bottom-0 w-[88vw] max-w-[390px] bg-gradient-to-b from-navy-950 via-[#0d2240] to-navy-950 text-white border-l border-brand-400/25 shadow-2xl flex flex-col overflow-hidden animate-remotion-drawer">
          {/* Ambient radial glow */}
          <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 -left-16 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          {/* Drawer Hero Header with Live Lottie Orbital Ring & Transparent Logo */}
          <div className="relative px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
            <Link
              to="/"
              onClick={(e) => handleHeaderNavClick(e, '/', 'Home')}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0 animate-remotion-logo">
                <Lottie
                  src={SR_TRANSITION_LOTTIE}
                  loop
                  autoplay
                  className="w-16 h-16"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <SmartImage
                    src={header.logoUrl || '/logo.png'}
                    alt="SR Global Consultants Logo"
                    className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,159,227,0.55)]"
                    fallback={
                      <img
                        src="/logo.png"
                        alt="SR Global Consultants Logo"
                        className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,159,227,0.55)]"
                      />
                    }
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-base text-white tracking-wider truncate">
                    SR GLOBAL
                  </span>
                </div>
                <span className="inline-block bg-brand-500/20 text-brand-300 border border-brand-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
                  Pakistan • Australia
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-colors shrink-0"
              aria-label="Close navigation slider"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Remotion Sweeping Highlight Bar */}
          <div className="relative h-[2px] w-full bg-white/10 overflow-hidden shrink-0">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-brand-400 to-amber-300 animate-remotion-sweep" />
          </div>

          {/* Staggered Remotion Page Cards */}
          <nav className="relative flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300/90">
                Explore Pages
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {navLinks.length} Sections
              </span>
            </div>

            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.path;
              const { icon: Icon, subtitle } = getNavItemMeta(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleHeaderNavClick(e, link.path, link.name)}
                  style={{ animationDelay: `${70 + idx * 55}ms` }}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all animate-remotion-drawer-item ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/25 via-brand-500/15 to-transparent border-brand-400/50 shadow-lg shadow-brand-500/10'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-brand-400/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'bg-white/10 text-brand-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-100'}`}>
                      {link.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {subtitle}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Bottom Staggered Action Dock (Honest Consultation Wording — Zero "Free" Word) */}
          <div
            style={{ animationDelay: '340ms' }}
            className="relative px-4 pt-3 pb-5 border-t border-white/10 bg-slate-950/60 backdrop-blur-md space-y-2.5 shrink-0 animate-remotion-drawer-cta"
          >
            <Link
              to="/book-appointment"
              onClick={(e) => handleHeaderNavClick(e, '/book-appointment', 'Book Consultation')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-500/25 text-sm transition-all active:scale-[0.99]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation Appointment</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`tel:${header.phonePakistan}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="truncate">Call PK Office</span>
              </a>
              <a
                href={`tel:${header.phoneAustralia}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="truncate">Call AU Office</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    )}
    </>
  );
};
