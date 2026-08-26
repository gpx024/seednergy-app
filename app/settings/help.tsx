import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const questions = [
  ["Does Seednergy replace professional advice?", "No. Seednergy offers practical growing guidance for your selected cycle. AI photo checks can be wrong and are not professional horticultural, medical or food-safety advice."],
  ["Who can see my photos?", "Your cycle and harvest photos are private to your account. They are sent through Seednergy’s backend only when needed for the feature you choose."],
  ["Can I grow without notifications?", "Yes. Notifications are optional. Your current action always remains available inside the app."],
  ["What happens if a photo check fails?", "Your cycle continues normally. Unclear, rejected and provider-error checks do not use your allowance."],
  ["How do I remove my data?", "Open Account and privacy, then Delete account. The process removes your profile, cycle history and stored photos."],
] as const;

export default function HelpScreen() {
  const router = useRouter();
  return <ScreenContainer scroll contentStyle={styles.container}><View style={styles.header}><Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable><Text accessibilityRole="header" style={styles.title}>Help and FAQs</Text></View>{questions.map(([question, answer]) => <AppCard key={question} style={styles.card}><Text style={styles.question}>{question}</Text><Text style={styles.answer}>{answer}</Text></AppCard>)}</ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.xl }, header: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText, flex: 1 }, card: { gap: tokens.spacing.sm }, question: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, answer: { ...tokens.typography.body, color: tokens.colors.ink82 } });
