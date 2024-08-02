/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const theme = {
   light: {
    background: "216 38.46% 97.45%",
    foreground: "215.29 19.32% 34.51%",
    muted: "212.73 35.48% 93.92%",
    mutedForeground: "211 11% 36%",
    popover: "211 70% 100%",
    popoverForeground: "215.29 19.32% 34.51%",
    card: "0 0% 100%",
    cardForeground: "215.29 19.32% 34.51%",
    border: "169.81 43.18% 94.59%",
    input: "180 100% 99.61%",
    primary: "173.41 80.39% 40%",
    primaryForeground: "0 0% 100%",
    secondary: "214.29 67.8% 95.22%",
    secondaryForeground: "215.29 19.32% 34.51%",
    accent: "210 100% 98.04%",
    accentForeground: "215.29 19.32% 34.51%",
    destructive: "2 82.15% 52.59%",
    destructiveForeground: "2 8.49% 97.48%",
    ring: "173.41 80.39% 40%",
    radius: "0.5rem"
  },
  dark: {
    background: "211 5.8% 8.72%",
    foreground: "211 37% 98%",
    muted: "201.51 21.93% 11.99%",
    mutedForeground: "201.51 9.09% 40.9%",
    popover: "211 42% 0%",
    popoverForeground: "211 37% 98%",
    card: "0 0% 1%",
    cardForeground: "211 37% 99%",
    border: "211 8.31% 9.94%",
    input: "211 11% 13%",
    primary: "173.41 80.39% 40%",
    primaryForeground: "0 0% 100%",
    secondary: "211 8.31% 14.2%",
    secondaryForeground: "211 9% 76%",
    accent: "211 9% 16%",
    accentForeground: "211 9% 76%",
    destructive: "2 92% 60%",
    destructiveForeground: "0 0% 100%",
    ring: "211 94% 45%"
  }
}


  export const Colors = {
    light: {
      text: '#11181C',
      background:  theme.light.background,
      tint: tintColorLight,
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: tintColorLight,
    },
    dark: {
      text: '#ECEDEE',
      background:  theme.dark.background,
      tint: tintColorDark,
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: tintColorDark,
    },
  };
  
export const themes = theme;