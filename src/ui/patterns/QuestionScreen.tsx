import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton, OptionRow, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

interface QuestionOption {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface QuestionScreenProps {
  step: number;
  title: string;
  description: string;
  options: readonly QuestionOption[];
  nextHref: Href;
  buttonLabel: string;
  initialSelection?: number;
}

export function QuestionScreen({ step, title, description, options, nextHref, buttonLabel, initialSelection = 0 }: QuestionScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialSelection);
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <OnboardingHeader step={step} />
      <View style={styles.heading}><Text accessibilityRole="header" maxFontSizeMultiplier={1.7} style={styles.title}>{title}</Text><Text maxFontSizeMultiplier={2} style={styles.description}>{description}</Text></View>
      <View accessibilityRole="radiogroup" style={styles.options}>{options.map((option, index) => <OptionRow key={option.title} {...option} selected={selected === index} onPress={() => setSelected(index)} />)}</View>
      <AppButton label={buttonLabel} onPress={() => router.push(nextHref)} style={styles.action} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  heading: { gap: tokens.spacing.sm },
  title: { ...tokens.typography.display, color: tokens.colors.terracotta },
  description: { ...tokens.typography.body, color: tokens.colors.ink82 },
  options: { gap: tokens.spacing.cardGap },
  action: { marginTop: "auto" }
});
