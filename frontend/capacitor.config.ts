import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.medtime.app',
  appName: 'MedTime',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://medtime-w8a2.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#7C3AED",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
}

export default config 