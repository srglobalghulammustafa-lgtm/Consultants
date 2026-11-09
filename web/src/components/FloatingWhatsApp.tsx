import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useSiteSettings();
  const whatsappConfig = settings.whatsapp;

  if (!whatsappConfig.isActive) return null;

  // Clean phone number (strip spaces, +, dashes)
  const cleanPhone = whatsappConfig.phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
    whatsappConfig.defaultMessage || 'Hello SR Global Consultants! I would like to inquire about study options.'
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
