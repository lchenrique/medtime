import React from "react";
import { Avatar as TamaguiAvatar } from "tamagui";

export type AvatarProps = {
  src: string
}


const Avatar = ({src}:AvatarProps) => {
  return (
    <TamaguiAvatar circular size="$5">
      <TamaguiAvatar.Image
        accessibilityLabel="Cam"
        src={src}
      />
      <TamaguiAvatar.Fallback backgroundColor="$blue10" />
    </TamaguiAvatar>
  );
};

export { Avatar };
