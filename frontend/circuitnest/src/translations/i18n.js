import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import { nl_translation } from "./dutch";
import { en_translation } from "./english";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        },
        resources: {
            en: en_translation,
            nl: nl_translation
        }
    });

export default i18n