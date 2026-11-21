import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { SmartImage } from './SmartImage';
import { usePageTransition } from './PageTransition';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const { navigateWithTransition } = usePageTransition();
  const footer = settings.footer;
  const footerLogoSrc = footer.logoUrl || settings.header.logoUrl || '/logo.png';
  const badgeImageSrc = footer.accreditedBadgeImageUrl || '/assets/icef_badge.png';

  const handleFooterNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    label?: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (path.startsWith('http') || path.startsWith('/admin')) return;
    e.preventDefault();
    navigateWithTransition(path, label);
  };

  return (
    <footer className="bg-navy-950 text-slate-300 pt-12 sm:pt-16 pb-24 sm:pb-10 border-t-4 border-brand-500">
      <div className="max-w-[98%] xl:max-w-[96%] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand Info & ICEF Badge side-by-side */}
          <div>
            <div className="flex items-center gap-3.5 mb-4">
              <SmartImage 
                src={footerLogoSrc} 
                alt="SR Global Consultants Logo" 
                className="h-12 sm:h-14 w-auto object-contain bg-white/95 px-2.5 py-1.5 rounded-lg shrink-0"
                fallback={
                  <img 
                    src="/logo.png" 
                    alt="SR Global Consultants Logo" 
                    className="h-12 sm:h-14 w-auto object-contain bg-white/95 px-2.5 py-1.5 rounded-lg shrink-0" 
                  />
                }
              />
              <div>
                <span className="font-serif font-black text-xl text-white tracking-wider block">SR GLOBAL</span>
                <span className="bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mt-0.5">Pakistan • Australia</span>
                <p className="text-[10px] font-bold text-brand-400 tracking-widest uppercase mt-1">— CONSULTANTS —</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {footer.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-lg text-xs text-brand-300">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Certified Educational Counselors</span>
              </div>

              {/* ICEF Accredited Badge Link in Column 1 */}
              <a
                href={footer.accreditedBadgeUrl || 'https://www.icef.com/agency-status/#7092'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group mt-2"
                title="ICEF Accredited Certified Global Partner #7092"
              >
                <SmartImage
                  src={badgeImageSrc}
                  alt="ICEF Accredited Certified Global Partner"
                  className="h-20 w-auto object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform bg-navy-900/80 p-1"
                  fallback={
                    <img
                      src="/assets/icef_badge.png"
                      alt="ICEF Accredited Certified Global Partner"
                      className="h-20 w-auto object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform bg-navy-900/80 p-1"
                    />
                  }
                />
              </a>
            </div>
          </div>

          {/* Study Destinations */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide border-b border-navy-800 pb-2">
              {footer.destinationsTitle || 'Study Destinations'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footer.destinationLinks.map((link) => (
                <li key={link.id || link.label}>
                  <Link
                    to={link.path}
                    onClick={(e) => handleFooterNavClick(e, link.path, link.label)}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Resources */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide border-b border-navy-800 pb-2">
              {footer.quickLinksTitle || 'Useful Links'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footer.quickLinks.map((link) => (
                <li key={link.id || link.label}>
                  <Link
                    to={link.path}
                    onClick={(e) => handleFooterNavClick(e, link.path, link.label)}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500 group-hover:translate-x-1 transition-transform" />
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
        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 text-xs text-slate-400">
          <p>© {footer.copyrightYear || new Date().getFullYear()} {footer.copyright}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              to="/privacy-policy"
              onClick={(e) => handleFooterNavClick(e, '/privacy-policy', 'Privacy Policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={(e) => handleFooterNavClick(e, '/terms', 'Terms of Service')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors opacity-70 hover:opacity-100 flex items-center gap-1">
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
