import { createThemeBuilder } from '@tamagui/theme-builder';

const palettes = {
  light: [
    'hsla(220, 44%, 100%, 1)', // --background
    'hsla(220, 67%, 0%, 1)', // --foreground
    'hsla(220, 39%, 92%, 1)', // --muted
    'hsla(220, 13%, 27%, 1)', // --muted-foreground
    'hsla(220, 44%, 100%, 1)', // --popover
    'hsla(220, 67%, 0%, 1)', // --popover-foreground
    'hsla(0, 0%, 99%, 1)', // --card
    'hsla(0, 0%, 0%, 1)', // --card-foreground
    'hsla(220, 2%, 93%, 1)', // --border
    'hsla(220, 2%, 93%, 1)', // --input
    'hsla(220, 66%, 58%, 1)', // --primary
    'hsla(0, 0%, 100%, 1)', // --primary-foreground
    'hsla(220, 7%, 91%, 1)', // --secondary
    'hsla(220, 7%, 31%, 1)', // --secondary-foreground
    'hsla(220, 13%, 82%, 1)', // --accent
    'hsla(220, 13%, 22%, 1)', // --accent-foreground
    'hsla(0, 86%, 45%, 1)', // --destructive
    'hsla(0, 0%, 100%, 1)', // --destructive-foreground
    'hsla(220, 66%, 58%, 1)' // --ring
  ],
  dark: [
    'hsla(220, 43%, 4%, 1)', // --background
    'hsla(220, 16%, 99%, 1)', // --foreground
    'hsla(220, 39%, 8%, 1)', // --muted
    'hsla(220, 13%, 73%, 1)', // --muted-foreground
    'hsla(220, 43%, 4%, 1)', // --popover
    'hsla(220, 16%, 99%, 1)', // --popover-foreground
    'hsla(220, 43%, 5%, 1)', // --card
    'hsla(0, 0%, 100%, 1)', // --card-foreground
    'hsla(220, 2%, 13%, 1)', // --border
    'hsla(220, 2%, 13%, 1)', // --input
    'hsla(220, 66%, 58%, 1)', // --primary
    'hsla(0, 0%, 100%, 1)', // --primary-foreground
    'hsla(220, 7%, 9%, 1)', // --secondary
    'hsla(220, 7%, 69%, 1)', // --secondary-foreground
    'hsla(220, 13%, 16%, 1)', // --accent
    'hsla(220, 13%, 76%, 1)', // --accent-foreground
    'hsla(0, 86%, 49%, 1)', // --destructive
    'hsla(0, 0%, 100%, 1)', // --destructive-foreground
    'hsla(220, 66%, 58%, 1)' // --ring
  ],
  light_accent: [
    'hsla(180, 60%, 83%, 1)', // --accent
    'hsla(72, 75%, 40%, 0)', // --accent-hover
    'hsla(72, 75%, 40%, 0.25)', // --accent-focus
    'hsla(72, 75%, 40%, 0.5)', // --accent-active
    'hsla(72, 75%, 40%, 0.75)', // --accent-pressed
    'hsla(72, 75%, 40%, 1)', // --accent-transparent
    'hsla(72, 75%, 43%, 1)', // --accent-foreground
    'hsla(72, 75%, 46%, 1)', // --accent-border
    'hsla(72, 75%, 48%, 1)', // --accent-card
    'hsla(72, 75%, 51%, 1)', // --accent-input
    'hsla(72, 75%, 54%, 1)', // --accent-border-hover
    'hsla(72, 75%, 57%, 1)', // --accent-border-focus
    'hsla(72, 75%, 59%, 1)', // --accent-border-pressed
    'hsla(72, 75%, 62%, 1)', // --accent-background
    'hsla(72, 75%, 65%, 1)' // --accent-background-hover
  ],
  dark_accent: [
    'hsla(180, 60%, 45%, 1)', // --accent
    'hsla(72, 75%, 35%, 0)', // --accent-hover
    'hsla(72, 75%, 35%, 0.25)', // --accent-focus
    'hsla(72, 75%, 35%, 0.5)', // --accent-active
    'hsla(72, 75%, 35%, 0.75)', // --accent-pressed
    'hsla(72, 75%, 35%, 1)', // --accent-transparent
    'hsla(72, 75%, 38%, 1)', // --accent-foreground
    'hsla(72, 75%, 41%, 1)', // --accent-border
    'hsla(72, 75%, 43%, 1)', // --accent-card
    'hsla(72, 75%, 46%, 1)', // --accent-input
    'hsla(72, 75%, 49%, 1)', // --accent-border-hover
    'hsla(72, 75%, 52%, 1)', // --accent-border-focus
    'hsla(72, 75%, 54%, 1)', // --accent-border-pressed
    'hsla(72, 75%, 57%, 1)', // --accent-background
    'hsla(72, 75%, 60%, 1)' // --accent-background-hover
  ]
};

const templates = {
  light_base: {
    background: 0, foreground: 1, muted: 2, mutedForeground: 3, popover: 4, popoverForeground: 5,
    card: 6, cardForeground: 7, border: 8, input: 9, primary: 10, primaryForeground: 11, secondary: 12,
    secondaryForeground: 13, accent: 14, accentForeground: 15, destructive: 16, destructiveForeground: 17,
    ring: 18, radius: '0.5rem'
  },
  dark_base: {
    background: 0, foreground: 1, muted: 2, mutedForeground: 3, popover: 4, popoverForeground: 5,
    card: 6, cardForeground: 7, border: 8, input: 9, primary: 10, primaryForeground: 11, secondary: 12,
    secondaryForeground: 13, accent: 14, accentForeground: 15, destructive: 16, destructiveForeground: 17,
    ring: 18
  },
  light_accent_base: {
    accent: 0, accentHover: 1, accentFocus: 2, accentActive: 3, accentPressed: 4,
    accentForeground: 5, accentBorder: 6, accentCard: 7, accentInput: 8, accentBorderHover: 9,
    accentBorderFocus: 10, accentBorderPressed: 11, accentBackground: 12, accentBackgroundHover: 13
  },
  dark_accent_base: {
    accent: 0, accentHover: 1, accentFocus: 2, accentActive: 3, accentPressed: 4,
    accentForeground: 5, accentBorder: 6, accentCard: 7, accentInput: 8, accentBorderHover: 9,
    accentBorderFocus: 10, accentBorderPressed: 11, accentBackground: 12, accentBackgroundHover: 13
  }
};

export const themes = createThemeBuilder()
  .addPalettes(palettes)
  .addTemplates(templates)
  .addThemes({
    light: {
      template: 'light_base',
      palette: 'light',
    },
    dark: {
      template: 'dark_base',
      palette: 'dark',
    },
    light_accent: {
      template: 'light_accent_base',
      palette: 'light_accent'
    },
    dark_accent: {
      template: 'dark_accent_base',
      palette: 'dark_accent'
    }
  })
  .build();
