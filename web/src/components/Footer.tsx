import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const footer = settings.footer;

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-8 border-t-4 border-brand-500">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="SR Global" className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500" />
              <div>
                <span className="font-serif font-black text-xl text-white tracking-wider">SR GLOBAL</span>
                <p className="text-[10px] font-bold text-brand-400 tracking-widest uppercase">— CONSULTANTS —</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {footer.tagline}
            </p>
            <div className="inline-flex items-center gap-2 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-lg text-xs text-brand-300">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Certified Educational Counselors</span>
            </div>
          </div>

          {/* Study Destinations */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide border-b border-navy-800 pb-2">Study Destinations</h4>
            <ul className="space-y-2.5 text-sm">
              {footer.destinationLinks.map((link) => (
                <li key={link.id || link.label}>
                  <Link to={link.path} className="hover:text-brand-400 transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Resources */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide border-b border-navy-800 pb-2">Useful Links</h4>
            <ul className="space-y-2.5 text-sm">
              {footer.quickLinks.map((link) => (
                <li key={link.id || link.label}>
                  <Link to={link.path} className="hover:text-brand-400 transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide border-b border-navy-800 pb-2">Head Office</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                <span>{footer.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                <a href={`tel:${footer.phonePakistan}`} className="hover:text-white">
                  PK: {footer.phonePakistan}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${footer.phoneAustralia}`} className="hover:text-white">
                  AU: {footer.phoneAustralia}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`mailto:${footer.email}`} className="hover:text-white">
                  {footer.email}
                </a>
              </p>
              <p className="flex items-center gap-2.5 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{footer.officeHours}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {footer.copyright}</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/admin" className="hover:text-white transition-colors opacity-70 hover:opacity-100 flex items-center gap-1">
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
