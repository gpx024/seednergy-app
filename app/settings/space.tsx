import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { SpaceEnvironment, SpaceLightCondition } from "@/src/ports/ProfileRepository";
import { useProfile } from "@/src/presentation/profile/useProfile";
import { AppButton, BackHeader, FeedbackState, OptionRow, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const environments = [
  { value: "indoor", title: "Indoors", description: "Inside your home or another enclosed space.", icon: "home-outline" },
  { value: "balcony", title: "Balcony", description: "A sheltered outdoor balcony or terrace.", icon: "business-outline" },
  { value: "outdoor", title: "Outdoors", description: "A garden, patio, allotment, or open outdoor space.", icon: "leaf-outline" }
] as const;

const lightConditions = [
  { value: "low", title: "Low light", description: "Mostly shade or limited natural daylight.", icon: "moon-outline" },
  { value: "medium", title: "Medium light", description: "Bright ambient light with some indirect sun.", icon: "partly-sunny-outline" },
  { value: "bright", title: "Bright light", description: "Strong daylight or several hours of direct sun.", icon: "sunny-outline" }
] as const;

export default function SpaceSettingsScreen() {
  const router = useRouter();
  const profile = useProfile();
  const [environment, setEnvironment] = useState<SpaceEnvironment>("indoor");
  const [lightCondition, setLightCondition] = useState<SpaceLightCondition>("bright");

  useEffect(() => {
    if (profile.data?.environment) setEnvironment(profile.data.environment as SpaceEnvironment);
    if (profile.data?.lightCondition) setLightCondition(profile.data.lightCondition as SpaceLightCondition);
  }, [profile.data]);

  async function save() {
    try {
      await profile.updateSpaceConditions(environment, lightCondition);
      router.back();
    } catch { /* The profile hook exposes the actionable error inline. */ }
  }

  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader center={<Text accessibilityRole="header" style={styles.title}>Space conditions</Text>} />
    <Text style={styles.body}>Update the conditions Seednergy uses to tailor guidance for your cycles.</Text>
    {profile.loading ? <FeedbackState kind="loading" title="Loading your space" description="Reading your current growing conditions." /> : null}
    {profile.error ? <FeedbackState actionLabel="Try again" description={profile.error.message} kind="error" onAction={() => void profile.reload()} title="Your space is unavailable" /> : null}
    {!profile.loading && !profile.error ? <>
      <View style={styles.section}><Text style={styles.label}>Growing space</Text>{environments.map((option) => <OptionRow key={option.value} {...option} onPress={() => setEnvironment(option.value)} selected={environment === option.value} />)}</View>
      <View style={styles.section}><Text style={styles.label}>Available light</Text>{lightConditions.map((option) => <OptionRow key={option.value} {...option} onPress={() => setLightCondition(option.value)} selected={lightCondition === option.value} />)}</View>
      {profile.spaceError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{profile.spaceError.message}</Text> : null}
      <AppButton label="Save space conditions" loading={profile.spaceSaving} onPress={() => void save()} />
    </> : null}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  title: { ...tokens.typography.displayMedium, color: tokens.colors.brand },
  body: { ...tokens.typography.body, color: tokens.colors.textSecondary, marginHorizontal: tokens.spacing.md },
  section: { gap: tokens.spacing.cardGap },
  label: { ...tokens.typography.label, color: tokens.colors.olive, marginHorizontal: tokens.spacing.md, textTransform: "uppercase" },
  error: { ...tokens.typography.bodyStrong, color: tokens.colors.alert, textAlign: "center" }
});
