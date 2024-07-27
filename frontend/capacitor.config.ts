import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.syncio',
  appName: 'Syncio',
  webDir: 'dist/frontend',
  server: {
    androidScheme: 'http',
    cleartext: true,
    // url: "http://localhost", // url of android app
    allowNavigation: [
      "http://localhost",
      "ws://localhost",
    ]
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
