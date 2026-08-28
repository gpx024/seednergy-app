import { Image, StyleSheet, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { tokens } from "@/src/ui/tokens";

interface ProfileAvatarProps {
  size?: number;
  uri?: string | null;
}

export function ProfileAvatar({ size = 46, uri }: ProfileAvatarProps) {
  const radius = size / 2;
  return uri
    ? <Image accessibilityLabel="Profile photo" source={{ uri }} style={{ borderRadius: radius, height: size, width: size }} />
    : <View accessibilityLabel="Seednergy profile placeholder" style={[styles.fallback, { borderRadius: radius, height: size, width: size }]}><BrandMark color={tokens.colors.olive} width={Math.max(18, size * 0.34)} /></View>;
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", backgroundColor: tokens.colors.raised, justifyContent: "center" }
});
