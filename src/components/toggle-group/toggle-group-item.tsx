import { styled, ToggleGroup } from 'tamagui';

const ToggleGroupItem = styled(ToggleGroup.Item, {
  borderWidth: "$1",
  variants: {
    active: {
      true: {
        borderColor: "$primary",
        backgroundColor: "$card",
      },
      false: {
        borderColor: "$border",
      },
    },
  },
});

export { ToggleGroupItem };
