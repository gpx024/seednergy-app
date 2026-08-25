import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const exchangeStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    if (!code) {
      setError(t("onboarding.authCallbackMissing"));
      return;
    }
    auth.completeSignIn(code)
      .then(() => {
        router.replace("/(onboarding)/profile-basics");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t("onboarding.authError")));
  }, [auth, code, router, t]);

  return <ScreenContainer contentStyle={styles.container}><View style={styles.content}>{error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : <><ActivityIndicator color={tokens.colors.olive} /><Text style={styles.message}>{t("onboarding.authCallbackBody")}</Text></>}</View></ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { justifyContent: "center" },
  content: { alignItems: "center", gap: tokens.spacing.md },
  message: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center" },
  error: { ...tokens.typography.body, color: tokens.colors.alert, textAlign: "center" }
});
