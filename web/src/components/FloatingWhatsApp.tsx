import React from 'react';
import { MessageCircle } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.whatsappNumber}?text=${encodeURIComponent(
    'Hello SR Global Consultants! I am visiting your website and would like to inquire about study options and visa guidance.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group ring-4 ring-white/50"
      aria-label="Chat with SR Global on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 animate-pulse" />
      <span className="font-bold text-sm tracking-wide hidden sm:inline">
        WhatsApp Desk
      </span>
    </a>
  );
};
