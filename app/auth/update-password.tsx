import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = password.length >= 8 && password === confirmation;
  async function save() {
    setLoading(true); setError(null);
    try { await auth.updatePassword(password); router.replace("/(tabs)/home"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("onboarding.passwordUpdateError")); }
    finally { setLoading(false); }
  }
  return <ScreenContainer contentStyle={styles.container}><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.newPasswordTitle")}</Text><Text style={styles.body}>{t("onboarding.newPasswordBody")}</Text></View><View style={styles.fields}><AppField autoComplete="new-password" label={t("onboarding.newPassword")} onChangeText={setPassword} secureTextEntry value={password} /><AppField autoComplete="new-password" label={t("onboarding.confirmPassword")} onChangeText={setConfirmation} secureTextEntry value={confirmation} /></View>{password && confirmation && password !== confirmation ? <Text style={styles.error}>{t("onboarding.passwordMismatch")}</Text> : null}{error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}<AppButton disabled={!valid} label={t("onboarding.savePassword")} loading={loading} onPress={() => void save()} /></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.xl }, heading: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.display, color: tokens.colors.brand }, body: { ...tokens.typography.body, color: tokens.colors.textSecondary }, fields: { gap: tokens.spacing.md }, error: { ...tokens.typography.caption, color: tokens.colors.alert, textAlign: "center" } });
