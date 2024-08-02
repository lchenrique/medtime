import type { Medicine } from "@/@types/medicine";
import Icon from "@/components/icon/icon";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AlarmClock } from "lucide-react-native";
import type { ReactNode } from "react";
import { MedicineCard } from "../medicine-card";

export interface MedicineCardGroupProps {
  name: ReactNode;
  items: Medicine[];
  onItemPress?: (item:Medicine) => void;
}

const MedicineCardGroup = ({ name, items, onItemPress }: MedicineCardGroupProps) => {
  return (
    <>
      <ThemedView
        flexDirection="row"
        alignItems="center"
        px="$2"
        mt="$2"
        borderRadius="$3"
        bg="$muted"
      >
        <Icon icon={AlarmClock} color="foreground" />
        <ThemedText type="subtitle" color="$foreground" p="$2">
          {name}
        </ThemedText>
      </ThemedView>
      {items.map((v: Medicine) => {
        return (
          <MedicineCard
            key={v.id}
            name={v.name}
            description={v?.description || ""}
            onPress={() => onItemPress &&  onItemPress(v)}
          />
        );
      })}
    </>
  );
};

export default MedicineCardGroup;
