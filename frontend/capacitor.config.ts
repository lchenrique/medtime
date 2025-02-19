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
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      importance: "high",
      sound: "notification_sound",
      foregroundPresentation: true,
      launchActivity: true,
      android: {
        autoCancel: true,
        clickAction: ".MainActivity",
        priority: "high",
        visibility: "public",
        sound: "notification_sound"
      }
    },
    LocalNotifications: {
      smallIcon: "ic_stat_medtimelogo",
      iconColor: "#7C3AED",
      sound: "notification_sound",
      schedule: {
        allowWhileIdle: true
      },
      actions: [
        {
          id: "REMINDER_ACTION",
          title: "Tomar Medicamento",
          requiresAuthentication: false
        }
      ]
    }
  }
}

export default config 