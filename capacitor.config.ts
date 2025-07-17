import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'myApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1043757467407-efa6n2svme94bgh3rk0v9jc3sbqc0br4.apps.googleusercontent.com', // Replace with your actual Google OAuth client ID
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
