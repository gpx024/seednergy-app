import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function TimeScreen() {
  const { t } = useTranslation();
  return <QuestionScreen buttonLabel={t("actions.continue")} description={t("onboarding.timeBody")} initialSelection={1} nextHref="/(onboarding)/motivation" options={[{ title: t("onboarding.minimal"), description: t("onboarding.minimalBody"), icon: "time-outline" }, { title: t("onboarding.moderate"), description: t("onboarding.moderateBody"), icon: "calendar-outline" }, { title: t("onboarding.flexible"), description: t("onboarding.flexibleBody"), icon: "infinite-outline" }]} step={3} title={t("onboarding.timeTitle")} />;
}
