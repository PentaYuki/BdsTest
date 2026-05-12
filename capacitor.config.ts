import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pentayuki.bdstest',
  appName: 'BdsTest',
  webDir: 'out',
  server: {
    url: 'https://bds-test-seven.vercel.app',
    cleartext: true
  }
};

export default config;
