import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandWordmark } from "@/src/ui/components/BrandWordmark";
import { ProfileAvatar } from "@/src/ui/components/ProfileAvatar";
import { tokens } from "@/src/ui/tokens";

interface BrandHeaderProps {
  wordmarkWidth?: number;
  locationLabel?: string;
  profileImageUri?: string | null;
  onProfilePress: () => void;
}

export function BrandHeader({ wordmarkWidth = 125, locationLabel, profileImageUri, onProfilePress }: BrandHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><View style={styles.copy}><BrandWordmark color={tokens.colors.brand} width={wordmarkWidth} />{locationLabel ? <Text style={styles.location}>{locationLabel}</Text> : null}</View><Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={onProfilePress} style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarPressed]}><ProfileAvatar showEditHint uri={profileImageUri} /></Pressable></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", flexShrink: 0, justifyContent: "space-between", minHeight: 58, width: "100%" },
  copy: { alignItems: "flex-start", gap: tokens.spacing.xxs },
  location: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, color: tokens.colors.olive },
  avatarButton: { alignItems: "center", backgroundColor: tokens.colors.raised, borderRadius: tokens.radii.pill, height: 54, justifyContent: "center", width: 54, ...tokens.elevation.raisedSm },
  avatarPressed: { opacity: 0.82 }
});
