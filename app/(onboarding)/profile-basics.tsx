import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function ProfileBasicsScreen() {
  const { t } = useTranslation();
  return <QuestionScreen buttonLabel={t("actions.continue")} description={t("onboarding.locationBody")} nextHref="/(onboarding)/light" options={[{ title: t("onboarding.indoor"), description: t("onboarding.indoorBody"), icon: "home-outline" }, { title: t("onboarding.balcony"), description: t("onboarding.balconyBody"), icon: "business-outline" }, { title: t("onboarding.outdoor"), description: t("onboarding.outdoorBody"), icon: "leaf-outline" }]} step={1} title={t("onboarding.locationTitle")} />;
}
