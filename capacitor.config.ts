import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'myApp',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1071050647044-3efo3l0fj7crdvlrv0m1b2gvfqgbkf45.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
