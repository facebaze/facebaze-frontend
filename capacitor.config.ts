import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.facebase.app',
  appName: 'FaceBase',
  webDir: 'out',

  ios: {
    scheme: 'FaceBase',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0F172A',
    },
  },
}

export default config
