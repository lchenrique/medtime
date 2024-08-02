import { Button } from "@/components/button/button";
import { themes } from "@/constants/Colors";
import { Tabs } from "expo-router";
import { BriefcaseMedical, Home, Plus } from "lucide-react-native";
import React from "react";
import { useColorScheme } from "react-native";
import { useTheme, View } from "tamagui";

export default function TabLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme()
  console.log(colorScheme)
  return (
    <Tabs
      tabBar={({ insets, state, navigation }) => {
        const isIndexScreen = state.routes[state.index].name === "index";
        return (
          <View
            w="100%"
            justifyContent="space-evenly"
            position="absolute"
            bottom="$0"
            alignItems="center"
          >
            <View
              flexDirection="row"
              w="80%"
              justifyContent="space-evenly"
              alignItems="center"
              h="$6"
              mx="auto"
              position="absolute"
              bottom="$2"
              borderRadius="$5"
              borderWidth="$0.5"
              borderColor="$border"
              bg={`hsla(${themes[colorScheme!].card.split(" ").join(",")}, 0.9)`}
            >
              {state.routes.map((route, index) => {
                const focused = state.index === index;
                const color = focused
                  ? theme.primary.val
                  : theme.mutedForeground.val;
                const Icon = route.name === "index" ? Home : BriefcaseMedical;

                return (
                  <Button
                    key={route.key}
                    bg="transparent"
                    onPress={() => navigation.navigate(route.name)}
                  >
                    <Icon size={30} color={color} />
                  </Button>
                );
              })}
              {isIndexScreen && (
                <Button
                  bg="$primary"
                  w="$5"
                  h="$5"
                  position="absolute"
                  bottom={70}
                  right={0}
                  onPress={() => navigation.navigate("modals/new-med")}
                >
                  <Plus size={30} color={theme.primaryForeground.val} />
                </Button>
              )}
            </View>
          </View>
        );
      }}
      
      screenOptions={{
        tabBarActiveTintColor: theme.primary?.val,
        tabBarInactiveTintColor: theme.mutedForeground?.val,
        headerShown: false,
      }}
    >
    </Tabs>
  );
}
