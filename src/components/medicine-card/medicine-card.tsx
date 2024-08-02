import { Pill } from "lucide-react-native";
import React from "react";
import { useTheme } from "tamagui";
import { Button } from "../button/button";
import Icon from "../icon/icon";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export interface MedicineCardProps{
  name: string;
  description: string;
  onPress?: () => void;
}

const MedicineCard = ({name, description, onPress}:MedicineCardProps) => {
  const theme = useTheme()
  return (
    <Button
      shadowColor="#d5d5d5"
      shadowOffset={{
        width: 0,
        height: 12,
      }}
      shadowOpacity={0.24}
      shadowRadius={13.84}
      elevation={17}
      borderRadius="$4"
      size="$7"
      px="$3"
      w="100%"
      justifyContent="flex-start"
      bg="$card"
      borderWidth={0}
      onPress={onPress}
      pressStyle={{
        backgroundColor: theme.accent.val,
      }}
    >
      <Icon icon={Pill} />
      <ThemedView  flex={1}>
        <ThemedText fontWeight="bold" fontSize="$5">
          {name}
        </ThemedText>
        <ThemedText opacity={0.4} ellipse >
          {description}
        </ThemedText>
      </ThemedView>
    </Button>
  );
};

export { MedicineCard };

