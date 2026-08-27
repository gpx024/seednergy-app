import { describe, expect, it } from "vitest";

import { i18n } from "@/src/i18n";

describe("localisation foundation", () => {
  it("loads the English tab labels", () => {
    expect(i18n.t("tabs.home")).toBe("Home");
    expect(i18n.t("tabs.cycles")).toBe("Cycles");
    expect(i18n.t("tabs.garden")).toBe("Garden");
  });
});
