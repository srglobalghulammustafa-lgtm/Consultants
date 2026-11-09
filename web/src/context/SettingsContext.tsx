import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';
import { COMPANY_CONTACT, SITE_METRICS } from '../data/mockData';

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp: {
    phone: COMPANY_CONTACT.whatsappNumber || '923278321560',
    defaultMessage: 'Hello SR Global Consultants! I am visiting your website and would like to inquire about study options and visa guidance.',
    isActive: true,
  },
  header: {
    topAnnouncement: '1st Floor, 239A Civic Center, Gujranwala',
    phonePakistan: COMPANY_CONTACT.phonePakistan || '+92 327 8321560',
    phoneAustralia: COMPANY_CONTACT.phoneAustralia || '+61 415 331872',
    email: COMPANY_CONTACT.email || 'contact@srglobalconsultants.com',
    address: COMPANY_CONTACT.address || '1st Floor, 239A Civic Center, Gujranwala, Pakistan',
    navLinks: [
      { id: '1', name: 'Home', path: '/', isVisible: true },
      { id: '2', name: 'About Us', path: '/about', isVisible: true },
      { id: '3', name: 'Courses & Programs', path: '/courses', isVisible: true },
      { id: '4', name: 'Study Destinations', path: '/destinations', isVisible: true },
      { id: '5', name: 'Contact Office', path: '/contact', isVisible: true },
    ],
  },
  footer: {
    tagline: 'Premier international education & migration consulting firm providing genuine guidance for Australia, United Kingdom, USA, Canada, and Europe.',
    address: COMPANY_CONTACT.address || '1st Floor, 239A Civic Center, Gujranwala, Pakistan',
    phonePakistan: COMPANY_CONTACT.phonePakistan || '+92 327 8321560',
    phoneAustralia: COMPANY_CONTACT.phoneAustralia || '+61 415 331872',
    email: COMPANY_CONTACT.email || 'contact@srglobalconsultants.com',
    officeHours: COMPANY_CONTACT.officeHours || 'Monday - Saturday: 10:00 AM - 6:00 PM (PKT)',
    destinationLinks: [
      { id: 'd1', label: 'Australia (Subclass 500)', path: '/destinations' },
      { id: 'd2', label: 'United Kingdom (Graduate Route)', path: '/destinations' },
      { id: 'd3', label: 'Canada (Study Permit & PGWP)', path: '/destinations' },
      { id: 'd4', label: 'United States (F-1 & STEM OPT)', path: '/destinations' },
      { id: 'd5', label: 'Europe (Germany, Italy, Ireland)', path: '/destinations' },
    ],
    quickLinks: [
      { id: 'q1', label: 'Book Appointment', path: '/book-appointment' },
      { id: 'q2', label: 'Courses Catalog', path: '/courses' },
      { id: 'q3', label: 'About Agency', path: '/about' },
      { id: 'q4', label: 'Contact Gujranwala', path: '/contact' },
    ],
    copyright: 'SR Global Consultants. All rights reserved. Gujranwala • Australia.',
  },
  metrics: {
    studentsGuided: SITE_METRICS.studentsGuided || 5200,
    partnerUniversities: SITE_METRICS.partnerUniversities || 160,
    visaSuccessRate: SITE_METRICS.visaSuccessRate || '98.4%',
    yearsExperience: SITE_METRICS.yearsExperience || '12+',
  },
  ipstack: {
    apiKey: 'ebe42933fab1deddffa7e20d5186e6e3',
    isEnabled: true,
    requestCount: 0,
    maxMonthlyLimit: 99,
    currentMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  },
};

const LOCAL_STORAGE_KEY = 'sr_global_site_settings_v1';

interface SettingsContextType {
  settings: SiteSettings;
  updateWhatsApp: (config: SiteSettings['whatsapp']) => Promise<boolean>;
  updateHeader: (config: SiteSettings['header']) => Promise<boolean>;
  updateFooter: (config: SiteSettings['footer']) => Promise<boolean>;
  updateMetrics: (config: SiteSettings['metrics']) => Promise<boolean>;
  updateIpstack: (config: SiteSettings['ipstack']) => Promise<boolean>;
  resetIpstackQuota: () => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  isSyncing: boolean;
  isLiveSupabase: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Could not read cached settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const fetchLiveSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value');

        if (!error && data && data.length > 0) {
          if (!isMounted) return;
          setIsLiveSupabase(true);
          const liveMerged = { ...settings };

          data.forEach((row) => {
            if (row.setting_key === 'whatsapp_config' && row.setting_value) {
              liveMerged.whatsapp = { ...liveMerged.whatsapp, ...row.setting_value };
            } else if (row.setting_key === 'header_config' && row.setting_value) {
              liveMerged.header = { ...liveMerged.header, ...row.setting_value };
            } else if (row.setting_key === 'footer_config' && row.setting_value) {
              liveMerged.footer = { ...liveMerged.footer, ...row.setting_value };
            } else if (row.setting_key === 'metrics_config' && row.setting_value) {
              liveMerged.metrics = { ...liveMerged.metrics, ...row.setting_value };
            } else if (row.setting_key === 'ipstack_config' && row.setting_value) {
              liveMerged.ipstack = { ...liveMerged.ipstack, ...row.setting_value };
            }
          });

          setSettings(liveMerged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(liveMerged));
        } else {
          // If table not found or empty, fallback gracefully
          if (error) {
            console.info('Supabase site_settings notice (using client cache/defaults):', error.message);
          }
        }
      } catch (err) {
        console.info('Settings fetch using fallback:', err);
      }
    };

    fetchLiveSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveToSupabase = async (key: string, value: any) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { setting_key: key, setting_value: value, updated_at: new Date().toISOString() },
          { onConflict: 'setting_key' }
        );

      if (!error) {
        setIsLiveSupabase(true);
        return true;
      } else {
        console.warn(`Supabase sync notice for ${key}:`, error.message);
        return false;
      }
    } catch (e) {
      console.warn('Network sync notice for settings:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateWhatsApp = async (config: SiteSettings['whatsapp']) => {
    const next = { ...settings, whatsapp: config };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('whatsapp_config', config);
    return true;
  };

  const updateHeader = async (config: SiteSettings['header']) => {
    const next = { ...settings, header: config };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('header_config', config);
    return true;
  };

  const updateFooter = async (config: SiteSettings['footer']) => {
    const next = { ...settings, footer: config };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('footer_config', config);
    return true;
  };

  const updateMetrics = async (config: SiteSettings['metrics']) => {
    const next = { ...settings, metrics: config };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('metrics_config', config);
    return true;
  };

  const updateIpstack = async (config: SiteSettings['ipstack']) => {
    const next = { ...settings, ipstack: config };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('ipstack_config', config);
    return true;
  };

  const resetIpstackQuota = async () => {
    const next = {
      ...settings,
      ipstack: {
        ...settings.ipstack,
        requestCount: 0,
        lastUpdated: new Date().toISOString(),
      },
    };
    setSettings(next);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    await saveToSupabase('ipstack_config', next.ipstack);
    return true;
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    await saveToSupabase('whatsapp_config', DEFAULT_SETTINGS.whatsapp);
    await saveToSupabase('header_config', DEFAULT_SETTINGS.header);
    await saveToSupabase('footer_config', DEFAULT_SETTINGS.footer);
    await saveToSupabase('metrics_config', DEFAULT_SETTINGS.metrics);
    return true;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateWhatsApp,
        updateHeader,
        updateFooter,
        updateMetrics,
        updateIpstack,
        resetIpstackQuota,
        resetToDefaults,
        isSyncing,
        isLiveSupabase,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SettingsProvider');
  }
  return context;
};
