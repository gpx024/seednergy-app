import { StyleSheet, Text, View } from "react-native";

import { AppCard, BackHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const questions = [
  ["Does Seednergy replace professional advice?", "No. Seednergy offers practical growing guidance for your selected cycle. AI photo checks can be wrong and are not professional horticultural, medical or food-safety advice."],
  ["Who can see my photos?", "Your cycle and harvest photos are private to your account. They are sent through Seednergy’s backend only when needed for the feature you choose."],
  ["Can I grow without notifications?", "Yes. Notifications are optional. Your current action always remains available inside the app."],
  ["What happens if a photo check fails?", "Your cycle continues normally. Unclear, rejected and provider-error checks do not use your allowance."],
  ["How do I remove my data?", "Open Account and privacy, then Delete account. The process removes your profile, cycle history and stored photos."],
] as const;

export default function HelpScreen() {
  return <ScreenContainer scroll contentStyle={styles.container}><BackHeader center={<Text accessibilityRole="header" style={styles.title}>Help and FAQs</Text>} /><AppCard style={styles.card}>{questions.map(([question, answer], index) => <View key={question} style={[styles.answerBlock, index > 0 && styles.answerBorder]}><Text style={styles.question}>{question}</Text><Text style={styles.answer}>{answer}</Text></View>)}</AppCard></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl }, title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText }, card: { padding: 0, overflow: "hidden" }, answerBlock: { gap: tokens.spacing.xs, padding: tokens.spacing.md }, answerBorder: { borderTopColor: tokens.colors.border, borderTopWidth: 1 }, question: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, answer: { ...tokens.typography.body, color: tokens.colors.ink82 } });
