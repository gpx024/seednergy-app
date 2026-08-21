import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function MotivationScreen() {
  const { t } = useTranslation();
  return <QuestionScreen buttonLabel={t("onboarding.findSeed")} description={t("onboarding.motivationBody")} nextHref="/(onboarding)/first-cycle" options={[{ title: t("onboarding.growFood"), icon: "restaurant-outline" }, { title: t("onboarding.reconnect"), icon: "leaf-outline" }, { title: t("onboarding.calm"), icon: "water-outline" }, { title: t("onboarding.sustainability"), icon: "earth-outline" }]} step={4} title={t("onboarding.motivationTitle")} />;
}
