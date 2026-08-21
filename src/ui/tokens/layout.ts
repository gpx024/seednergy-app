import { StyleSheet } from "react-native";

export const layout = {
  border: { thin: StyleSheet.hairlineWidth, standard: 1 },
  icon: { inline: 16, sm: 16, md: 21, lg: 24, xl: 32 },
  size: { avatar: 48, gaugeHeroWidth: 52, gaugeHeroHeight: 82, gaugeRowWidth: 38, gaugeRowHeight: 60, imageLarge: 128, imageSmall: 64, touchTarget: 48, touchTargetLarge: 54 }
} as const;
