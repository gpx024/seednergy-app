import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import { CycleGauge } from "@/src/ui/components/CycleGauge";
import { StageBadge, type StageBadgeTone } from "@/src/ui/components/StageBadge";
import { tokens } from "@/src/ui/tokens";

interface CycleRowProps {
  name: string;
  meta: string;
  status: string;
  statusTone?: StageBadgeTone;
  progress: number;
  day: number;
  imageSource: ImageSourcePropType;
  onPress?: () => void;
}

export function CycleRow({ name, meta, status, statusTone = "active", progress, day, imageSource, onPress }: CycleRowProps) {
  return (
    <Pressable accessibilityLabel={`${name}, ${status}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image accessibilityLabel="" resizeMode="cover" source={imageSource} style={styles.photo} />
      <View style={styles.body}><Text maxFontSizeMultiplier={1.8} style={styles.name}>{name}</Text><Text maxFontSizeMultiplier={1.8} style={styles.meta}>{meta}</Text><StageBadge label={status} tone={statusTone} /></View>
      <View style={styles.gauge}><CycleGauge accessibilityLabel={`${day} days into cycle`} compact day={day} progress={progress} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 104, alignItems: "stretch", flexDirection: "row", borderRadius: tokens.radii.card, backgroundColor: tokens.colors.card, overflow: "hidden", ...tokens.elevation.raisedRow },
  pressed: { opacity: 0.82 },
  photo: { minHeight: 104, width: 88 },
  body: { flex: 1, minWidth: 0, justifyContent: "center", paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.xs },
  name: { ...tokens.typography.cardTitle, color: tokens.colors.forest, marginBottom: 2 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 16.8, color: tokens.colors.ink82, marginBottom: tokens.spacing.xs },
  gauge: { alignItems: "center", justifyContent: "center", paddingRight: tokens.spacing.md }
});
