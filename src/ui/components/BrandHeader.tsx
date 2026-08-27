import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import { BrandWordmark } from "@/src/ui/components/BrandWordmark";
import { tokens } from "@/src/ui/tokens";

interface BrandHeaderProps {
  wordmarkWidth?: number;
  locationLabel?: string;
  profileImage: ImageSourcePropType;
}

export function BrandHeader({ wordmarkWidth = 104, locationLabel, profileImage }: BrandHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><View style={styles.copy}><BrandWordmark color={tokens.colors.brand} width={wordmarkWidth} />{locationLabel ? <Text style={styles.location}>{locationLabel}</Text> : null}</View><Image accessibilityLabel="Profile" source={profileImage} style={styles.avatar} /></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", flexShrink: 0, justifyContent: "space-between", minHeight: 58, width: "100%" },
  copy: { alignItems: "flex-start", gap: tokens.spacing.xxs },
  location: { ...tokens.typography.caption, color: tokens.colors.olive },
  avatar: { height: tokens.layout.size.avatar, width: tokens.layout.size.avatar, borderRadius: tokens.radii.pill, ...tokens.elevation.photo }
});
