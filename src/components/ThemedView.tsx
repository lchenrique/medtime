import { useThemeColor } from "@/hooks/useThemeColor";
import { View, type ViewProps } from "tamagui";

export type ThemedViewProps = ViewProps & {};

export function ThemedView({ ...otherProps }: ThemedViewProps) {
  return <View {...otherProps} />;
}
