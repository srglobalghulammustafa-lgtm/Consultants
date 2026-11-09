import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, Menu, X, Bell, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { playPremiumChime } from '../lib/audio';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);
  const [lastChimedId, setLastChimedId] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBellDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = useLocation();
  const { settings, clearBroadcastHistory } = useSiteSettings();
  const header = settings.header;
  const activeBroadcast = settings.activeBroadcast;
  const broadcastHistory = settings.broadcastHistory || [];

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

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white">
      {/* Broadcast Announcement Header Banner (if broadcast active) */}
      {hasActiveBroadcast && (
        <div className={`text-white text-xs py-2.5 px-4 transition-all ${
          activeBroadcast.priority === 'Urgent' 
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 animate-pulse' 
            : 'bg-gradient-to-r from-brand-700 via-navy-900 to-brand-800'
        }`}>
          <div className="max-w-[98%] xl:max-w-[96%] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1 bg-white/20 rounded-full shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </span>
              <div className="truncate">
                <strong className="font-bold mr-1.5 uppercase tracking-wide bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                  {activeBroadcast.priority === 'Urgent' ? '⚡ URGENT ANNOUNCEMENT' : '📢 OFFICIAL UPDATE'}
                </strong>
                <span className="font-semibold text-slate-100">{activeBroadcast.title}:</span>{' '}
                <span className="text-slate-200 truncate">{activeBroadcast.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {activeBroadcast.link && (
                <a
                  href={activeBroadcast.link}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium px-2.5 py-1 rounded-md text-[11px] inline-flex items-center gap-1 transition-colors"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setDismissedBannerId(activeBroadcast.id)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-navy-950 text-white text-xs py-2 px-4 border-b border-navy-800">
        <div className="max-w-[98%] xl:max-w-[96%] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {header.topAnnouncement || header.address}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              {header.email}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href={`tel:${header.phonePakistan}`} className="flex items-center gap-1 hover:text-brand-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-green-400" />
              PK: {header.phonePakistan}
            </a>
            <span className="text-slate-600">|</span>
            <a href={`tel:${header.phoneAustralia}`} className="hidden sm:flex items-center gap-1 hover:text-brand-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              AU: {header.phoneAustralia}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[98%] xl:max-w-[96%] mx-auto">
        <div className="flex justify-between items-center h-20">
          {/* Official Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="SR Global Consultants Logo" 
              className="h-12 w-12 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl text-navy-950 tracking-wider">SR GLOBAL</span>
                <span className="bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Pakistan • Australia</span>
              </div>
              <p className="text-[11px] font-semibold tracking-widest text-brand-600 uppercase">
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600 bg-brand-50 font-bold'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar (Notification Bell & Book Appointment CTA) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Notification Bell Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (!showBellDropdown) clearBroadcastHistory();
                  setShowBellDropdown(!showBellDropdown);
                  playPremiumChime();
                }}
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition-colors border border-slate-200"
                title="View Broadcast Notifications"
              >
                <Bell className="w-5 h-5" />
                {broadcastHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {broadcastHistory.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showBellDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-600" />
                      <h4 className="font-bold text-navy-950 text-sm">Notifications & Announcements</h4>
                    </div>
                    <button
                      onClick={() => playPremiumChime()}
                      className="text-slate-400 hover:text-brand-600 p-1"
                      title="Test Audio Chime"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {broadcastHistory.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No broadcast notifications yet.
                      </div>
                    ) : (
                      broadcastHistory.map((item) => (
                        <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-brand-100 text-brand-800'
                            }`}>
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
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.message}</p>
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

            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                playPremiumChime();
              }}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 relative"
            >
              <Bell className="w-5 h-5" />
              {broadcastHistory.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Aegean Cyan & Amber gradient accent strip */}
      <div className="h-[2px] w-full bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500 shadow-sm" />

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-brand-50 hover:text-brand-600"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/book-appointment"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
