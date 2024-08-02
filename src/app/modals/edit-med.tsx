import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { MedForm } from "@/forms/med-form";
import { Image } from "tamagui";
import { PageHeader } from "@/components/page/header";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={require("@/assets/images/medicine-illustration.png")}
          style={styles.headerImage}
        />
      }
    >
      <PageHeader title="New medicine" />
      <MedForm />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 270,
    width: "100%",
    marginTop: 20,
    bottom: 0,
  },
});
