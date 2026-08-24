import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface PhotoFrameProps {
  source: ImageSourcePropType;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  shape?: "default" | "capsule";
}

export function PhotoFrame({ source, accessibilityLabel, style, shape = "default" }: PhotoFrameProps) {
  return <View style={[styles.frame, shape === "capsule" && styles.capsule, style]}><Image accessibilityLabel={accessibilityLabel} resizeMode="cover" source={source} style={[styles.image, shape === "capsule" && styles.capsuleImage]} /></View>;
}

const styles = StyleSheet.create({
  frame: { padding: 6, borderRadius: tokens.radii.media, backgroundColor: tokens.colors.card, overflow: "hidden", ...tokens.elevation.raisedLg },
  image: { height: "100%", width: "100%", borderRadius: 20, ...tokens.elevation.photo },
  capsule: { borderRadius: 999 },
  capsuleImage: { borderRadius: 999 }
});
