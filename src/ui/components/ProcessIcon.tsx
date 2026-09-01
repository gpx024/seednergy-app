import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type ProcessStage = "seed" | "germination" | "seedling" | "grown";

const artwork = {
  seed: require("../../../assets/process/seednergy-process-01-seed.png"),
  germination: require("../../../assets/process/seednergy-process-02-germination.png"),
  seedling: require("../../../assets/process/seednergy-process-03-seedling.png"),
  grown: require("../../../assets/process/seednergy-process-04-grown.png")
} as const;

interface ProcessIconProps {
  stage: ProcessStage;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProcessIcon({ stage, size = 54, style }: ProcessIconProps) {
  const imageSize = size * 0.72;
  return (
    <View accessibilityLabel={`${stage} growth stage`} style={[styles.surface, { borderRadius: size / 2, height: size, width: size }, style]}>
      <Image resizeMode="contain" source={artwork[stage]} style={{ height: imageSize, width: imageSize }} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    alignItems: "center",
    backgroundColor: tokens.colors.raised,
    justifyContent: "center",
    ...tokens.elevation.floating
  }
});
