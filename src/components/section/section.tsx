import type { ReactNode } from "react";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export interface SectionProps {
  title: ReactNode;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => {
  return (
    <ThemedView>
      <ThemedView>
        <ThemedText fontWeight="bold" fontSize="$6" py="$2">
          {title}
        </ThemedText>
      </ThemedView>
      {children}
    </ThemedView>
  );
};

export { Section };

