import { Button } from "@/components/button/button";
import { DateTimePicker } from "@/components/form/input/date-time-picker";
import Icon from "@/components/icon/icon";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ToggleGroupItem } from "@/components/toggle-group/toggle-group-item";
import { Clock } from "lucide-react-native";
import { useState } from "react";
import { Input, Label, TextArea, ToggleGroup } from "tamagui";

export interface MedFormProps {}
const MedForm = ({}: MedFormProps) => {
  const [activeFrequency, setActiveFrequency] = useState("6");
  const frequency = [
    { value: "6", label: "6/6 hs" },
    { value: "8", label: "8/8 hs" },
    { value: "12", label: "12/ 12 hs" },
  ];

  return (
    <>
      <ThemedView bg="$card" p="$4" borderRadius="$4">
        <Label color="$foreground">Name:</Label>
        <Input bg="$background" color="$foreground" borderColor="$muted" />
        <Label color="$foreground">
          Description: <ThemedText color="$muted">(optional)</ThemedText>
        </Label>
        <TextArea bg="$background" color="$foreground" borderColor="$muted" />

        <ToggleGroup
          type="single"
          onValueChange={setActiveFrequency}
          w="100%"
          mt="$5"
        >
          {frequency.map((v) => {
            return (
              <ToggleGroupItem
                key={v.value}
                flex={1}
                value={v.value}
                active={activeFrequency === v.value}
                scale={activeFrequency === v.value ? 1.1 : 1}
                animation={"quickest"}
              >
                <ThemedView alignItems="center" gap='$2'>
                  <Icon  color="foreground" icon={Clock} />
                  <ThemedText color="$foreground">{v.label}</ThemedText>
                </ThemedView>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <ThemedView flexDirection="row" gap="$3">
          <ThemedView flex={1}>
            <Label color="$foreground">Times per day</Label>
            <Input
              bg="$background"
              color="$foreground"
              borderColor="$muted"
              value={String(24 / Number(activeFrequency))}
              onChange={(e) => setActiveFrequency(e.nativeEvent.text)}
            />
          </ThemedView>
          <ThemedView flex={1}>
            <Label color="$foreground">Duration: ( days )</Label>
            <Input
              bg="$background"
              color="$foreground"
              borderColor="$muted"
              keyboardType="number-pad"
            />
          </ThemedView>
        </ThemedView>
        <ThemedView flexDirection="row" gap="$3">
          <ThemedView flex={1}>
            <Label color="$foreground">Start time:</Label>
            <DateTimePicker mode="time" />
          </ThemedView>
          <ThemedView flex={1}>
            <Label color="$foreground">Start date:</Label>
            <DateTimePicker mode="date" />
          </ThemedView>
        </ThemedView>
        <Button mt="$4" size="$4">
          Create
        </Button>
      </ThemedView>
    </>
  );
};

export { MedForm };

