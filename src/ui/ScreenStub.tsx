import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

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
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t(titleKey)}</Text>
      <Text style={styles.description}>{t(descriptionKey)}</Text>
      <View style={styles.actions}>
        {links.map((link) => (
          <Link key={link.href} href={link.href as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.action}>
              <Text style={styles.actionText}>{t(link.labelKey)}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", gap: tokens.spacing.md, padding: tokens.spacing.lg, backgroundColor: tokens.colors.background },
  title: { color: tokens.colors.textPrimary, fontSize: tokens.typography.title.fontSize, fontWeight: tokens.typography.title.fontWeight, lineHeight: tokens.typography.title.lineHeight },
  description: { color: tokens.colors.textSecondary, fontSize: tokens.typography.body.fontSize, lineHeight: tokens.typography.body.lineHeight },
  actions: { gap: tokens.spacing.sm, marginTop: tokens.spacing.md },
  action: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: tokens.spacing.md, borderRadius: tokens.radii.md, backgroundColor: tokens.colors.actionPrimary },
  actionText: { color: tokens.colors.actionPrimaryText, fontSize: tokens.typography.button.fontSize, fontWeight: tokens.typography.button.fontWeight }
});
