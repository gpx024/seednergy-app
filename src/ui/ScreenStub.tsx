import { Link, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

type TranslationKey = string;

interface ScreenLink {
  href: string;
  labelKey: TranslationKey;
}

interface ScreenStubProps {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  links?: readonly ScreenLink[];
}

export function ScreenStub({ titleKey, descriptionKey, links = [] }: ScreenStubProps) {
  const { t } = useTranslation();

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>{t(titleKey)}</Text>
        <Text style={styles.description}>{t(descriptionKey)}</Text>
      </View>
      <View style={styles.actions}>
        {links.map((link) => (
          <Link key={link.href} href={link.href as Href} asChild>
            <AppButton label={t(link.labelKey)} variant="primary" />
          </Link>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  content: { gap: tokens.spacing.md, justifyContent: "center", flex: 1 },
  title: { ...tokens.typography.title, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  actions: { gap: tokens.spacing.sm }
});
