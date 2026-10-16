import { Capacitor } from '@capacitor/core';

/**
 * Public Cloud Production Backend URL.
 * Automatically provisioned via render.yaml Blueprint:
 * https://the-college-life-backend.onrender.com/api
 */
export const CLOUD_API_BASE_URL = 'https://the-college-life-backend.onrender.com/api';

/**
 * Returns the active API base URL for both Web and Mobile (Capacitor) runtimes.
 * Resolution priority:
 * 1. Runtime override from localStorage ('tcl_api_base_url')
 * 2. Cloud production URL (when deployed)
 * 3. Local Wi-Fi network fallback for physical Android development (192.168.0.106:8080)
 * 4. Localhost fallback for browser development (http://localhost:8080/api)
 */
export function getApiBaseUrl(): string {
  try {
    const override = localStorage.getItem('tcl_api_base_url');
    if (override && override.trim()) {
      return override.trim().replace(/\/+$/, '');
    }
  } catch {}

  // If cloud production backend is configured
  if (CLOUD_API_BASE_URL && !CLOUD_API_BASE_URL.includes('your-subdomain')) {
    return CLOUD_API_BASE_URL.replace(/\/+$/, '');
  }

  // Physical Android device fallback on local Wi-Fi
  if (Capacitor.isNativePlatform()) {
    return 'http://192.168.0.106:8080/api';
  }

  // Web Browser environment
  return 'http://localhost:8080/api';
}
