import { StyleSheet } from "react-native";

export const layout = {
  border: {
    thin: StyleSheet.hairlineWidth,
    standard: 1
  },
  icon: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 40
  },
  size: {
    avatar: 48,
    imageLarge: 128,
    imageSmall: 64,
    touchTarget: 48,
    touchTargetLarge: 56
  }
} as const;
