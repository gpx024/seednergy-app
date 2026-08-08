import { ScreenStub } from "@/src/ui/ScreenStub";

export default function PhotoCheckScreen() {
  return <ScreenStub titleKey="screens.photoCheck.title" descriptionKey="screens.photoCheck.description" links={[{ href: "/cycle/placeholder/check-result", labelKey: "actions.viewResult" }]} />;
}
