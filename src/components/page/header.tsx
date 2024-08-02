import React, { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export interface PageHeadeerProps {
  title: ReactNode;
  description?: ReactNode;
}

const PageHeader = ({ title, description }: PageHeadeerProps) => {
  return (
    <ThemedView p="$2">
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{title}</ThemedText>
      </ThemedView>
      {description && <ThemedText color="$foreground" opacity={0.4}>{description}</ThemedText>}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    height: 270,
    width: "100%",
    marginTop: 20,
    bottom: 0,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

export { PageHeader };

