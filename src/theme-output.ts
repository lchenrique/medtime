type Theme = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  ring: string;
  radius: string;

}

function t(a: [number, number][]) {
  let res: Record<string,string> = {}
  for (const [ki, vi] of a) {
    res[ks[ki] as string] = vs[vi] as string
  }
  return res as Theme
}
const vs = [
  'hsla(220, 44%, 100%, 1)',
  'hsla(220, 67%, 0%, 1)',
  'hsla(220, 39%, 92%, 1)',
  'hsla(220, 13%, 27%, 1)',
  'hsla(0, 0%, 99%, 1)',
  'hsla(0, 0%, 0%, 1)',
  'hsla(220, 2%, 93%, 1)',
  'hsla(220, 66%, 58%, 1)',
  'hsla(0, 0%, 100%, 1)',
  'hsla(220, 7%, 91%, 1)',
  'hsla(220, 7%, 31%, 1)',
  'hsla(220, 13%, 82%, 1)',
  'hsla(220, 13%, 22%, 1)',
  'hsla(0, 86%, 45%, 1)',
  '0.5rem',
  'hsla(220, 43%, 4%, 1)',
  'hsla(220, 16%, 99%, 1)',
  'hsla(220, 39%, 8%, 1)',
  'hsla(220, 13%, 73%, 1)',
  'hsla(220, 43%, 5%, 1)',
  'hsla(220, 2%, 13%, 1)',
  'hsla(220, 7%, 9%, 1)',
  'hsla(220, 7%, 69%, 1)',
  'hsla(220, 13%, 16%, 1)',
  'hsla(220, 13%, 76%, 1)',
  'hsla(0, 86%, 49%, 1)',
  'hsla(180, 60%, 83%, 1)',
  'hsla(72, 75%, 40%, 0)',
  'hsla(72, 75%, 40%, 0.25)',
  'hsla(72, 75%, 40%, 0.5)',
  'hsla(72, 75%, 40%, 0.75)',
  'hsla(72, 75%, 40%, 1)',
  'hsla(72, 75%, 43%, 1)',
  'hsla(72, 75%, 46%, 1)',
  'hsla(72, 75%, 48%, 1)',
  'hsla(72, 75%, 51%, 1)',
  'hsla(72, 75%, 54%, 1)',
  'hsla(72, 75%, 57%, 1)',
  'hsla(72, 75%, 59%, 1)',
  'hsla(72, 75%, 62%, 1)',
  'hsla(180, 60%, 45%, 1)',
  'hsla(72, 75%, 35%, 0)',
  'hsla(72, 75%, 35%, 0.25)',
  'hsla(72, 75%, 35%, 0.5)',
  'hsla(72, 75%, 35%, 0.75)',
  'hsla(72, 75%, 35%, 1)',
  'hsla(72, 75%, 38%, 1)',
  'hsla(72, 75%, 41%, 1)',
  'hsla(72, 75%, 49%, 1)',
  'hsla(72, 75%, 52%, 1)',
]

const ks = [
'background',
'foreground',
'muted',
'mutedForeground',
'popover',
'popoverForeground',
'card',
'cardForeground',
'border',
'input',
'primary',
'primaryForeground',
'secondary',
'secondaryForeground',
'accent',
'accentForeground',
'destructive',
'destructiveForeground',
'ring',
'radius']


const n1 = t([[0, 0],[1, 1],[2, 2],[3, 3],[4, 0],[5, 1],[6, 4],[7, 5],[8, 6],[9, 6],[10, 7],[11, 8],[12, 9],[13, 10],[14, 11],[15, 12],[16, 13],[17, 8],[18, 7],[19, 14]])

export const light = n1
const n2 = t([[0, 15],[1, 16],[2, 17],[3, 18],[4, 15],[5, 16],[6, 19],[7, 8],[8, 20],[9, 20],[10, 7],[11, 8],[12, 21],[13, 22],[14, 23],[15, 24],[16, 25],[17, 8],[18, 7]])

export const dark = n2
const n3 = t([[14, 26],[-1, 27],[-1, 28],[-1, 29],[-1, 30],[15, 31],[-1, 32],[-1, 33],[-1, 34],[-1, 35],[-1, 36],[-1, 37],[-1, 38],[-1, 39]])

export const light_accent = n3
const n4 = t([[14, 40],[-1, 41],[-1, 42],[-1, 43],[-1, 44],[15, 45],[-1, 46],[-1, 47],[-1, 32],[-1, 33],[-1, 48],[-1, 49],[-1, 36],[-1, 37]])

export const dark_accent = n4