import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

const isNativePlatform = Capacitor.isNativePlatform()

export const storage = {
  async get(key: string) {
    if (isNativePlatform) {
      const { value } = await Preferences.get({ key })
      return value
    }
    return localStorage.getItem(key)
  },

  async set(key: string, value: string) {
    if (isNativePlatform) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  },

  async remove(key: string) {
    if (isNativePlatform) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  }
} 