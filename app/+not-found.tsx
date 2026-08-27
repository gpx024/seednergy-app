import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { FeedbackState, ScreenContainer } from "@/src/ui/components";

export default function NotFoundScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return <ScreenContainer contentStyle={{ flex: 1, justifyContent: "center" }}><FeedbackState actionLabel={t("release.returnHome")} description={t("release.notFoundBody")} kind="empty" onAction={() => router.replace("/")} title={t("release.notFoundTitle")} /></ScreenContainer>;
}
