import { useTranslation } from "react-i18next";
import { QuestionScreen } from "@/src/ui/patterns/QuestionScreen";

export default function TimeScreen() {
  const { t } = useTranslation();
  return <QuestionScreen answerKey="timeAvailability" buttonLabel={t("actions.continue")} description={t("onboarding.timeBody")} initialSelection={1} nextHref="/(onboarding)/motivation" options={[{ value: "minimal", title: t("onboarding.minimal"), description: t("onboarding.minimalBody"), icon: "time-outline" }, { value: "moderate", title: t("onboarding.moderate"), description: t("onboarding.moderateBody"), icon: "calendar-outline" }, { value: "flexible", title: t("onboarding.flexible"), description: t("onboarding.flexibleBody"), icon: "infinite-outline" }]} step={3} title={t("onboarding.timeTitle")} />;
}
