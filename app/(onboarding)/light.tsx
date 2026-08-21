import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function LightScreen() {
  const { t } = useTranslation();
  return <QuestionScreen buttonLabel={t("actions.continue")} description={t("onboarding.lightBody")} initialSelection={2} nextHref="/(onboarding)/time" options={[{ title: t("onboarding.lowLight"), description: t("onboarding.lowLightBody"), icon: "moon-outline" }, { title: t("onboarding.mediumLight"), description: t("onboarding.mediumLightBody"), icon: "partly-sunny-outline" }, { title: t("onboarding.brightLight"), description: t("onboarding.brightLightBody"), icon: "sunny-outline" }]} step={2} title={t("onboarding.lightTitle")} />;
}
