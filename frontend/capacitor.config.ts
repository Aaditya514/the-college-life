import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thecollegelife.app',
  appName: "The College Life We Didn't Have",
  webDir: 'dist/frontend/browser',
  server: {
    // Allows connecting to http:// backend in local network / development
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0B0C10'
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0B0C10',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;
