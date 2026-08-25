import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function MotivationScreen() {
  const { t } = useTranslation();
  return <QuestionScreen answerKey="motivation" buttonLabel={t("onboarding.findSeed")} description={t("onboarding.motivationBody")} nextHref="/(onboarding)/first-cycle" options={[{ value: "food", title: t("onboarding.growFood"), icon: "restaurant-outline" }, { value: "nature", title: t("onboarding.reconnect"), icon: "leaf-outline" }, { value: "calm", title: t("onboarding.calm"), icon: "water-outline" }, { value: "sustainability", title: t("onboarding.sustainability"), icon: "earth-outline" }]} step={4} title={t("onboarding.motivationTitle")} />;
}
