import { createTamagui } from "@tamagui/core";

import { config, tokens } from "@tamagui/config/v3";
import { themes } from "./constants/Colors";
const withHsl = (object: any): typeof themes.dark  => {
  return Object.entries(object).reduce((acc: any, [key, value]: any) => {
    acc[key] = `hsl(${value})`;
    return acc as  typeof themes.dark ;
  }, {});
};

const tamaguiConfig = createTamagui({
  ...config,
  themes: { light: withHsl(themes.light), dark: withHsl(themes.dark) },
  tokens: tokens,
});

type Conf = typeof tamaguiConfig;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export { tamaguiConfig };
