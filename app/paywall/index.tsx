import { ScreenStub } from "@/src/ui/ScreenStub";

export default function PaywallScreen() {
  return <ScreenStub titleKey="screens.paywall.title" descriptionKey="screens.paywall.description" links={[{ href: "/paywall/restore", labelKey: "actions.restorePurchases" }]} />;
}
