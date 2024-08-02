import { View, Text, useColorScheme } from "react-native";
import React, { cloneElement, type ComponentProps, type ReactElement } from "react";
import { useTheme } from "tamagui";
import type { UseThemeResult } from "@tamagui/core";
import type { LucideIcon, AArrowDown } from "lucide-react-native";
import { ThemedView } from "../ThemedView";

export type IconProps =  Omit<ComponentProps<LucideIcon>, "color"> &{
  color?: keyof UseThemeResult;
  icon: LucideIcon;
}  ;

const Icon = ({ icon, color, size, ...props }: IconProps) => {
  const theme = useTheme();
  const ComponentIcon = icon;
  return (
    <ThemedView h={size} w={size} >
      <ComponentIcon color={ (color && theme[color]?.val) || theme.foreground.val} size={size} {...props}/>
    </ThemedView>
  );
};

export default Icon;
