import { Button } from "@/components/button/button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";

export interface DateTimePickerProps{ 
  mode: "date" | "time" 
}

export function DateTimePicker({mode}:DateTimePickerProps) {
  const [val, setVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const timeHandle = (e: DateTimePickerEvent) => {
    if (e.type === "dismissed") {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);

    setVal(new Date(e.nativeEvent.timestamp).toISOString());

  };

  return (
    <ThemedView>
      {isOpen && (
        <RNDateTimePicker
          onChange={timeHandle}
          value={val ? new Date(val): new Date()}
          mode={mode}
          // display="spinner"
          minimumDate={new Date()}
        />
      )}
      <Button
        bg="$background" color="$foreground" borderColor="$muted"
        p="$2"
        h="$4"
        borderRadius="$5"
        borderWidth="$1"
        onPress={() => setIsOpen(!isOpen)}
      >
        <ThemedText>{val || "Select date"}</ThemedText>
      </Button>
    </ThemedView>
  );
}
