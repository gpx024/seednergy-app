import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { useHarvest } from "@/src/presentation/harvest/useHarvests";
import { AppButton, AppCard, BrandWordmark, FeedbackState, ProcessIcon, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function HarvestResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const resource = useHarvest(id);
  const harvest = resource.data;

  if (resource.loading) return <ScreenContainer><FeedbackState kind="loading" title="Saving your harvest" description="Preparing a few useful ideas for what comes next." /></ScreenContainer>;
  if (resource.error) return <ScreenContainer><FeedbackState kind="error" title="Your harvest could not be loaded" description={resource.error.message} actionLabel="Try again" onAction={() => void resource.reload()} /></ScreenContainer>;
  if (!harvest) return <ScreenContainer><FeedbackState kind="empty" title="Harvest not found" description="Your other harvests are available in the Private Garden." /></ScreenContainer>;

  const suggestions = harvest.record.suggestions;
  const source = harvest.photoUrl ? { uri: harvest.photoUrl } : null;
  const duration = harvest.seed.durationDaysMin === harvest.seed.durationDaysMax ? `${harvest.seed.durationDaysMax} days` : `${harvest.seed.durationDaysMin}–${harvest.seed.durationDaysMax} days`;

  function confirmRemovePhoto() {
    Alert.alert("Remove this private photo?", "The harvest record will remain, but the photo will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove photo", style: "destructive", onPress: () => void resource.removePhoto() }
    ]);
  }

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.celebrationHero}>
        <View style={styles.wordmark}><BrandWordmark width={106} /></View>
        {source ? <View style={styles.photoCluster}>
          <View style={styles.photoFrame}><Image accessibilityLabel={`${harvest.seed.commonName} harvest`} resizeMode="cover" source={source} style={styles.photo} /></View>
          <ProcessIcon stage="seed" style={styles.seedIcon} />
          <ProcessIcon stage="germination" style={styles.germinationIcon} />
          <ProcessIcon stage="seedling" style={styles.seedlingIcon} />
          <ProcessIcon stage="grown" style={styles.grownIcon} />
        </View> : <View style={styles.noPhoto}><ProcessIcon size={88} stage="grown" /><Text style={styles.noPhotoTitle}>No harvest photo added</Text><Text style={styles.noPhotoBody}>Your harvest is still saved privately in your Garden.</Text></View>}
        <View style={styles.heroCopy}><Text accessibilityRole="header" style={styles.heroTitle}>You grew this</Text><Text style={styles.heroSubtitle}>Cycle completed</Text></View>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statLabel}>SEED GROWN</Text><Text style={styles.statValue}>{harvest.seed.commonName}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>DURATION</Text><Text style={styles.statValue}>{duration}</Text></View>
        </View>
      </View>

      <View style={styles.details}>
        {harvest.photoUrl ? <AppButton label="Remove private photo" onPress={confirmRemovePhoto} variant="text" /> : null}
        <AppCard variant="nested" style={styles.freshCard}><Text style={styles.freshTitle}>{suggestions?.headline ?? `Fresh ${harvest.seed.commonName}, ready to enjoy`}</Text><Text style={styles.freshBody}>Harvested {formatDate(harvest.record.harvestedAt)}. {harvest.seed.storageGuidance}</Text></AppCard>
        <View style={styles.section}><Text style={styles.sectionTitle}>A few ways to use it</Text><AppCard style={styles.ideasCard}>{(suggestions?.ideas ?? fallbackIdeas(harvest.seed.commonName, harvest.seed.tasteProfile)).map((idea, index) => <View key={idea.title} style={[styles.idea, index > 0 && styles.ideaBorder]}><Text style={styles.ideaTitle}>{idea.title}</Text><Text style={styles.body}>{idea.description}</Text></View>)}</AppCard></View>
        <AppButton label="View Private Garden" onPress={() => router.replace("/harvest/gallery")} />
        <AppButton label="Grow another seed" onPress={() => router.replace("/(tabs)/explore")} variant="oliveText" />
      </View>
    </ScreenContainer>
  );
}

function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)); }
function fallbackIdeas(name: string, taste: string) { return [{ title: "Add it fresh", description: `Use your ${name} as a fresh finishing touch. ${taste}` }, { title: "Keep it simple", description: `Fold the ${name} through a sandwich, salad, or grain bowl just before serving.` }, { title: "Save some for later", description: "Follow the storage guidance above and use the most delicate leaves first." }]; }

const styles = StyleSheet.create({
  container: { paddingBottom: 0, paddingHorizontal: 0, paddingTop: 0 },
  celebrationHero: { alignItems: "center", backgroundColor: tokens.colors.harvestBackground, gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl, paddingHorizontal: tokens.spacing.xl, paddingTop: tokens.spacing.lg },
  wordmark: { alignItems: "center", minHeight: 32 },
  photoCluster: { aspectRatio: 0.78, marginVertical: tokens.spacing.sm, maxWidth: 292, position: "relative", width: "80%" },
  photoFrame: { backgroundColor: tokens.colors.raised, borderColor: "rgba(243,241,236,0.78)", borderRadius: tokens.radii.pill, borderWidth: 5, height: "100%", overflow: "hidden", width: "100%", ...tokens.elevation.inverted },
  photo: { height: "100%", width: "100%" },
  noPhoto: { alignItems: "center", gap: tokens.spacing.sm, minHeight: 260, justifyContent: "center" },
  noPhotoTitle: { ...tokens.typography.cardTitle, color: tokens.colors.raised, textAlign: "center" },
  noPhotoBody: { ...tokens.typography.body, color: tokens.colors.coachLabel, maxWidth: 260, textAlign: "center" },
  seedIcon: { left: "50%", marginLeft: -27, position: "absolute", top: -26 },
  germinationIcon: { left: -26, marginTop: -27, position: "absolute", top: "50%" },
  seedlingIcon: { marginTop: -27, position: "absolute", right: -26, top: "50%" },
  grownIcon: { bottom: -26, left: "50%", marginLeft: -27, position: "absolute" },
  heroCopy: { alignItems: "center", gap: 0 },
  heroTitle: { ...tokens.typography.invertedTitle, color: tokens.colors.raised, textAlign: "center" },
  heroSubtitle: { fontFamily: "CrimsonText_600SemiBold", fontSize: 20, lineHeight: 28, color: tokens.colors.coachLabel, textAlign: "center" },
  stats: { flexDirection: "row", gap: tokens.spacing.lg, justifyContent: "center", width: "100%" },
  stat: { alignItems: "center", backgroundColor: tokens.colors.harvestPanel, borderRadius: tokens.radii.card, flex: 1, gap: tokens.spacing.xxs, maxWidth: 148, paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.md, ...tokens.elevation.inverted },
  statLabel: { ...tokens.typography.label, color: tokens.colors.coachLabel, textAlign: "center" },
  statValue: { ...tokens.typography.cardTitle, color: tokens.colors.raised, textAlign: "center", textTransform: "capitalize" },
  details: { backgroundColor: tokens.colors.background, gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl, paddingHorizontal: tokens.spacing.gutter, paddingTop: tokens.spacing.xl },
  freshCard: { gap: tokens.spacing.xs },
  freshTitle: { ...tokens.typography.cardTitle, color: tokens.colors.raised },
  freshBody: { ...tokens.typography.body, color: tokens.colors.raised },
  section: { gap: tokens.spacing.sm },
  sectionTitle: { ...tokens.typography.displayMedium, color: tokens.colors.forest, marginHorizontal: tokens.spacing.xxs },
  ideasCard: { padding: 0, overflow: "hidden" },
  idea: { gap: tokens.spacing.xs, padding: tokens.spacing.md },
  ideaBorder: { borderTopColor: tokens.colors.border, borderTopWidth: 1 },
  ideaTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 }
});
