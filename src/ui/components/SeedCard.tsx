import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import { AppCard } from "@/src/ui/components/AppCard";
import { StageBadge } from "@/src/ui/components/StageBadge";
import { tokens } from "@/src/ui/tokens";

export type SeedCardAccess = "free" | "locked" | "comingSoon";

interface SeedCardProps {
  name: string;
  duration: string;
  difficulty: string;
  access: SeedCardAccess;
  accessLabel: string;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
}

export function SeedCard({ name, duration, difficulty, access, accessLabel, imageSource, onPress }: SeedCardProps) {
  const disabled = access !== "free" || !onPress;
  return (
    <Pressable accessibilityLabel={name} accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <AppCard style={[styles.card, access === "comingSoon" && styles.comingSoon]}>
        <View style={styles.imageArea}>{imageSource ? <Image accessibilityLabel="" resizeMode="cover" source={imageSource} style={styles.image} /> : null}{access === "locked" ? <View style={styles.lock}><Ionicons color={tokens.colors.ink} name="lock-closed-outline" size={22} /></View> : null}</View>
        <View style={styles.content}>
          <Text maxFontSizeMultiplier={1.8} style={styles.name}>{name}</Text>
          <View style={styles.meta}><Text style={styles.metaText}>{duration}</Text><Text style={styles.metaText}>{difficulty}</Text></View>
          <View style={styles.accessRow}>{access === "comingSoon" ? <Text style={styles.access}>{accessLabel}</Text> : <StageBadge label={accessLabel} tone={access === "locked" ? "premium" : "success"} />}</View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flexBasis: "45%", flexGrow: 1, minWidth: 150 },
  pressed: { opacity: 0.82 },
  card: { flex: 1, padding: 0, overflow: "hidden", ...tokens.elevation.raisedRow },
  comingSoon: { opacity: 0.62 },
  imageArea: { height: 158, backgroundColor: tokens.colors.sand, position: "relative" },
  image: { height: "100%", width: "100%" },
  lock: { alignItems: "center", justifyContent: "center", position: "absolute", right: tokens.spacing.sm, top: tokens.spacing.sm, height: 38, width: 38, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm },
  content: { gap: tokens.spacing.sm, padding: tokens.spacing.md },
  name: { ...tokens.typography.name, color: tokens.colors.forest },
  access: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  meta: { flexDirection: "row", gap: tokens.spacing.md },
  metaText: { fontFamily: "Inter_600SemiBold", fontSize: 12, lineHeight: 16, color: tokens.colors.ink82 },
  accessRow: { alignItems: "flex-start", minHeight: 28 }
});
