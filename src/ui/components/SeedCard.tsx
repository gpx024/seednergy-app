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
  return (
    <Pressable accessibilityLabel={name} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <AppCard style={[styles.card, access === "comingSoon" && styles.comingSoon]}>
        <View style={styles.imageArea}>
          {imageSource ? <Image accessibilityLabel="" source={imageSource} style={styles.image} /> : <Ionicons color={tokens.colors.actionPrimary} name="leaf-outline" size={tokens.layout.icon.xl} />}
          {access === "locked" ? <View style={styles.lock}><Ionicons color={tokens.colors.textSecondary} name="lock-closed-outline" size={tokens.layout.icon.sm} /></View> : null}
        </View>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.name}>{name}</Text>
            {access === "free" ? <StageBadge label={accessLabel} /> : null}
          </View>
          {access === "comingSoon" ? null : <View style={styles.meta}><Text style={styles.metaText}>{duration}</Text><Text style={styles.metaText}>{difficulty}</Text></View>}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  pressed: { opacity: 0.82 },
  card: { flex: 1, borderRadius: tokens.radii.card },
  comingSoon: { opacity: 0.62 },
  imageArea: { alignItems: "center", justifyContent: "center", height: tokens.layout.size.imageLarge, backgroundColor: tokens.colors.actionSecondary, position: "relative" },
  image: { height: "100%", width: "100%" },
  lock: { alignItems: "center", justifyContent: "center", position: "absolute", right: tokens.spacing.sm, top: tokens.spacing.sm, height: tokens.layout.icon.lg, width: tokens.layout.icon.lg, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.surface, ...tokens.elevation.card },
  content: { gap: tokens.spacing.xs, padding: tokens.spacing.md },
  heading: { alignItems: "flex-start", flexDirection: "row", gap: tokens.spacing.xs, justifyContent: "space-between" },
  name: { ...tokens.typography.cardTitle, color: tokens.colors.textPrimary, flexShrink: 1 },
  meta: { flexDirection: "row", gap: tokens.spacing.sm },
  metaText: { ...tokens.typography.caption, color: tokens.colors.textSecondary }
});
