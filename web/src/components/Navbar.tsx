import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, Menu, X, Shield, ExternalLink } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Courses & Programs', path: '/courses' },
    { name: 'Study Destinations', path: '/destinations' },
    { name: 'Contact Office', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white">
      {/* Top Notification Bar */}
      <div className="bg-navy-950 text-white text-xs py-2 px-4 border-b border-navy-800">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              1st Floor, 239A Civic Center, Gujranwala
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              {COMPANY_CONTACT.email}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href={`tel:${COMPANY_CONTACT.phonePakistan}`} className="flex items-center gap-1 hover:text-brand-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-green-400" />
              PK: {COMPANY_CONTACT.phonePakistan}
            </a>
            <span className="text-slate-600">|</span>
            <a href={`tel:${COMPANY_CONTACT.phoneAustralia}`} className="hidden sm:flex items-center gap-1 hover:text-brand-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              AU: {COMPANY_CONTACT.phoneAustralia}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-20">
          {/* Official Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="SR Global Consultants Logo" 
              className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-brand-500/20 group-hover:scale-105 transition-transform"
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

          {/* Book Appointment CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
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
