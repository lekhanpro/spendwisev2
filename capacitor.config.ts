import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spendwise.app',
  appName: 'SpendWise',
  webDir: 'dist',
  server: {
    url: 'https://spendwisev2.vercel.app',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
