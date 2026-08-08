import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/src/i18n/en.json";

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  lng: "en",
  resources: { en: { translation: en } }
});

export { i18n };
