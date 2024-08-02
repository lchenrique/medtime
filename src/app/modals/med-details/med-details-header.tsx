import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { ReactNode } from "react";

export interface MedDetailsHeaderProps {
  title: ReactNode;
}

const MedDetailsHeader = ({ title }: MedDetailsHeaderProps) => {
  return (
    <ThemedView overflow="hidden" flexWrap="nowrap" w={"170%"} h={200} mt={20} bottom={0}>
      <ThemedText color="$accent" position="absolute" top={5} left={20} fontSize={30} p="$0">
        {title}
      </ThemedText>
      <ThemedText
        opacity={0.3}
        color="$accent"
        flexWrap="nowrap"
        position="absolute"
        top={-40}
        left={-100}
        fontSize={180}
        p="$0"
        lineHeight={180}
      >
        {title}
      </ThemedText>
    </ThemedView>
  );
};

export { MedDetailsHeader };

