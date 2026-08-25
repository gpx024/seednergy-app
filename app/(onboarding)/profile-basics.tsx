import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function ProfileBasicsScreen() {
  const { t } = useTranslation();
  return <QuestionScreen answerKey="environment" buttonLabel={t("actions.continue")} description={t("onboarding.locationBody")} nextHref="/(onboarding)/light" options={[{ value: "indoor", title: t("onboarding.indoor"), description: t("onboarding.indoorBody"), icon: "home-outline" }, { value: "balcony", title: t("onboarding.balcony"), description: t("onboarding.balconyBody"), icon: "business-outline" }, { value: "outdoor", title: t("onboarding.outdoor"), description: t("onboarding.outdoorBody"), icon: "leaf-outline" }]} step={1} title={t("onboarding.locationTitle")} />;
}
