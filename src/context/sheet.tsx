import { Sheet } from "@/components/sheet/sheet";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BackHandler } from "react-native";

interface SheetContextProps {
  isSheetOpen: boolean;
  SheetContent: ReactNode | null;
  openSheet: (content: ReactNode) => void;
  closeSheet: () => void;
}

const SheetContext = createContext<SheetContextProps>({} as SheetContextProps);

export const useSheet = () => useContext(SheetContext);

export const SheetProvider = ({ children }: any) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [SheetContent, setSheetContent] = useState(null);

  const openSheet = (content: any) => {
    setSheetContent(content);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSheetContent(null);
  };

  useEffect(() => {
    const backAction = () => {
      if (isSheetOpen) {
        closeSheet();
        return true;
      }
      return false; // Continue to allow the native back handler to handle the back button
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [isSheetOpen]);

  return (
    <SheetContext.Provider
      value={{ isSheetOpen, openSheet, closeSheet, SheetContent }}
    >
      {children}
      <Sheet snapPoints={[90]} open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {SheetContent}
      </Sheet>
    </SheetContext.Provider>
  );
};
