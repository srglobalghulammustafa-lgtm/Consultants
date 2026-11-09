import { supabase } from './supabase';
import { LeadLocation, IpstackConfig } from '../types';

const IPSTACK_DEFAULT_KEY = 'ebe42933fab1deddffa7e20d5186e6e3';

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`; // e.g. "2026-11"
};

export const DEFAULT_IPSTACK_CONFIG: IpstackConfig = {
  apiKey: IPSTACK_DEFAULT_KEY,
  isEnabled: true,
  requestCount: 0,
  maxMonthlyLimit: 99,
  currentMonth: getCurrentMonthKey(),
};

/**
 * Fetches the current IPstack configuration & usage from Supabase/cache.
 * Automatically resets count to 0 if a new month has started.
 */
export const getIpstackConfig = async (): Promise<IpstackConfig> => {
  const currentMonth = getCurrentMonthKey();

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'ipstack_config')
      .single();

    if (!error && data?.setting_value) {
      let config: IpstackConfig = data.setting_value;

      // Check if new month has started -> auto-reset
      if (config.currentMonth !== currentMonth) {
        console.info(`[IPstack] New month detected (${currentMonth}). Resetting monthly quota from ${config.requestCount} to 0.`);
        config = {
          ...config,
          requestCount: 0,
          currentMonth: currentMonth,
          lastUpdated: new Date().toISOString(),
        };

        // Persist reset to Supabase
        await supabase
          .from('site_settings')
          .upsert(
            { setting_key: 'ipstack_config', setting_value: config, updated_at: new Date().toISOString() },
            { onConflict: 'setting_key' }
          );
      }

      return config;
    }
  } catch (err) {
    console.warn('[IPstack] Error reading config from Supabase, using defaults:', err);
  }

  return { ...DEFAULT_IPSTACK_CONFIG, currentMonth };
};

/**
 * Safely fetches the submitter's geolocation using IPstack with strict monthly quota guard (max 99).
 */
export const fetchUserLocationWithQuota = async (customApiKey?: string): Promise<LeadLocation | null> => {
  try {
    const config = await getIpstackConfig();
    const apiKey = customApiKey || config.apiKey || IPSTACK_DEFAULT_KEY;

    if (!config.isEnabled) {
      console.info('[IPstack] Geolocation is disabled in admin settings. Skipping lookup.');
      return null;
    }

    // Safety quota ceiling check: 99 requests
    if (config.requestCount >= config.maxMonthlyLimit) {
      console.warn(`[IPstack] Quota Safety Limit reached (${config.requestCount}/${config.maxMonthlyLimit}). Halting API calls to protect free plan.`);
      return null;
    }

    // Call APILayer IPstack check endpoint
    const url = `https://api.apilayer.net/ipstack/check?access_key=${apiKey}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    if (!response.ok) {
      console.warn(`[IPstack] API responded with status ${response.status}`);
      return null;
    }

    const json = await response.json();

    // Verify valid response object
    if (!json || json.error) {
      if (json?.error?.info) {
        console.warn('[IPstack API error]:', json.error.info);
      }
      return null;
    }

    // Increment request count by 1 and save back to Supabase
    const updatedCount = config.requestCount + 1;
    const updatedConfig: IpstackConfig = {
      ...config,
      requestCount: updatedCount,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await supabase
        .from('site_settings')
        .upsert(
          { setting_key: 'ipstack_config', setting_value: updatedConfig, updated_at: new Date().toISOString() },
          { onConflict: 'setting_key' }
        );
      console.info(`[IPstack] Location captured successfully. Monthly quota used: ${updatedCount}/${config.maxMonthlyLimit}`);
    } catch (saveErr) {
      console.warn('[IPstack] Could not persist incremented count:', saveErr);
    }

    return {
      ip: json.ip,
      city: json.city || 'Unknown',
      region_name: json.region_name || '',
      country_name: json.country_name || 'Pakistan',
      country_code: json.country_code || 'PK',
      latitude: json.latitude || undefined,
      longitude: json.longitude || undefined,
    };
  } catch (error) {
    console.warn('[IPstack] Geolocation fetch error (safe fallback):', error);
    return null;
  }
};
