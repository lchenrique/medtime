interface Window {
  __TAURI_METADATA__?: {
    platform: string
  }
  __TAURI__?: {
    notification: {
      isPermissionGranted: () => Promise<boolean>
      requestPermission: () => Promise<string>
      sendNotification: (options: { title: string; body: string }) => Promise<void>
    }
    invoke: (...args: any[]) => Promise<any>
  }
} 