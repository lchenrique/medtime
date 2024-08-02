import {
   Sheet as TamaguiSheet,
   type SheetProps as TamaguiSheetProps
} from 'tamagui';

export interface SheetProps extends TamaguiSheetProps {}

const Sheet = ({ children, open, ...props }: SheetProps) => {
   return (
      <TamaguiSheet
         dismissOnSnapToBottom
         dismissOnOverlayPress
         snapPoints={[70]}
         open={open}
         {...props}
      >
         <TamaguiSheet.Overlay opacity={0.5} bg="$black1" />
         <TamaguiSheet.Handle />
         <TamaguiSheet.Frame
            elevation={2}
            bg="$input"
            borderTopLeftRadius={30}
            borderTopRightRadius={30}
         >
            {children}
         </TamaguiSheet.Frame>
      </TamaguiSheet>
   );
};

export { Sheet };
