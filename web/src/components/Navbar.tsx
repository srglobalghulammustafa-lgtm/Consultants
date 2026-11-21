import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, Menu, X, Bell, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { playPremiumChime } from '../lib/audio';
import { usePageTransition } from './PageTransition';
import { SmartImage } from './SmartImage';

export const Navbar: React.FC = () => {
  const { navigateWithTransition } = usePageTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);
  const [lastChimedId, setLastChimedId] = useState<string | null>(null);

  const desktopBellRef = useRef<HTMLButtonElement>(null);
  const mobileBellRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setShowBellDropdown(false);
  }, [location.pathname]);

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
        { name: 'Track Status', path: '/track-appointment' },
        { name: 'Contact Office', path: '/contact' }
      ];

  const hasActiveBroadcast = activeBroadcast && activeBroadcast.id !== dismissedBannerId;

  const toggleBell = () => {
    setIsOpen(false);
    setShowBellDropdown((prev) => {
      const next = !prev;
      if (next) playPremiumChime();
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white">
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
      <div className="bg-navy-950 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-4 sm:px-6 lg:px-10 border-b border-navy-800">
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
          {/* Official Logo Brand */}
          <Link
            to="/"
            onClick={(e) => handleHeaderNavClick(e, '/', 'Home')}
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink-0"
          >
            <SmartImage
              src={header.logoUrl || '/logo.png'}
              alt="SR Global Consultants Logo"
              className="h-11 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform shrink-0"
              fallback={
                <img
                  src="/logo.png"
                  alt="SR Global Consultants Logo"
                  className="h-11 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform shrink-0"
                />
              }
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-lg sm:text-xl text-navy-950 tracking-wider whitespace-nowrap">
                  SR GLOBAL
                </span>
                <span className="hidden sm:inline-block bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                  Pakistan • Australia
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-brand-600 uppercase leading-tight">
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
                      ? 'text-brand-600 bg-brand-50 font-bold shadow-sm'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
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
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition-colors border border-slate-200"
              title="View Broadcast Notifications"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {broadcastHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {broadcastHistory.length}
                </span>
              )}
            </button>

            <Link
              to="/book-appointment"
              onClick={(e) => handleHeaderNavClick(e, '/book-appointment', 'Book Consultation')}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all whitespace-nowrap"
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
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 border border-slate-200 relative transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {broadcastHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {broadcastHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowBellDropdown(false);
                setIsOpen((prev) => !prev);
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 focus:outline-none transition-colors"
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
            className="absolute left-3 right-3 sm:left-auto sm:right-6 lg:right-10 top-full mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-tab-reveal"
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

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-1.5 shadow-2xl max-h-[calc(100vh-110px)] overflow-y-auto animate-tab-reveal">
          <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Navigation Menu
            </span>
            <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Pakistan • Australia
            </span>
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleHeaderNavClick(e, link.path, link.name)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-800 hover:bg-slate-50 hover:text-brand-600'
                }`}
              >
                <span>{link.name}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </Link>
            );
          })}

          <div className="pt-3 space-y-2.5 border-t border-slate-100 mt-2">
            <Link
              to="/book-appointment"
              onClick={(e) => handleHeaderNavClick(e, '/book-appointment', 'Book Consultation')}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-xl font-bold shadow-md text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Free Consultation</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`tel:${header.phonePakistan}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="truncate">Call PK Office</span>
              </a>
              <a
                href={`tel:${header.phoneAustralia}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate">Call AU Office</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
