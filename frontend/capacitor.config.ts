import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.medtime.app',
  appName: 'MedTime',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173'
      : 'https://medtime.vercel.app', // URL da Vercel
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