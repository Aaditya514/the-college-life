import { Capacitor } from '@capacitor/core';

/**
 * Returns the active API base URL for both Web and Mobile (Capacitor) runtimes.
 * On physical mobile devices, 'localhost' refers to the device itself.
 * Therefore, we dynamically target the host PC's Wi-Fi IP address (192.168.0.106:8080).
 */
export function getApiBaseUrl(): string {
  try {
    const override = localStorage.getItem('tcl_api_base_url');
    if (override && override.trim()) {
      return override.trim().replace(/\/+$/, '');
    }
  } catch {}

  // If running inside Capacitor on Android or iOS
  if (Capacitor.isNativePlatform()) {
    return 'http://192.168.0.106:8080/api';
  }

  // Web Browser environment
  return 'http://localhost:8080/api';
}
