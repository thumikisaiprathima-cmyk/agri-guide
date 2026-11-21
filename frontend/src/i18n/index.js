import { en } from "./en.js";
import { te } from "./te.js";
import { hi } from "./hi.js";
import { ta } from "./ta.js";
import { mr } from "./mr.js";
import { weatherTranslations } from "./weatherStrings.js";
import { dashboardTranslations } from "./dashboardStrings.js";
import { communityTranslations } from "./communityStrings.js";
import { equipmentTranslations } from "./equipmentStrings.js";
import { marketplaceTranslations } from "./marketplaceStrings.js";
import { smartFarmingTranslations } from "./smartFarmingStrings.js";
import { videoTranslations } from "./videoStrings.js";
import { schemeTranslations } from "./schemeStrings.js";
import { assistantTranslations } from "./assistantStrings.js";
import { adminTranslations } from "./adminStrings.js";
import { nasaTranslations } from "./nasaStrings.js";

export const dictionaries = { en, te, hi, ta, mr };

export const supportedLanguages = ["en", "te", "hi", "ta", "mr"];

// Add feature-specific sentences to every language dictionary. Keeping them in
// separate files makes translations easier to review and maintain.
for (const language of supportedLanguages) {
  dictionaries[language] = {
    ...dictionaries[language],
    ...(weatherTranslations[language] ?? {}),
    ...(dashboardTranslations[language] ?? {}),
    ...(communityTranslations[language] ?? {}),
    ...(equipmentTranslations[language] ?? {}),
    ...(marketplaceTranslations[language] ?? {}),
    ...(smartFarmingTranslations[language] ?? {}),
    ...(videoTranslations[language] ?? {}),
    ...(schemeTranslations[language] ?? {}),
    ...(assistantTranslations[language] ?? {}),
    ...(adminTranslations[language] ?? {}),
    ...(nasaTranslations[language] ?? {}),
  };
}

// If a translation is missing, fall back to English so the UI never breaks.
export function translate(language, key) {
  return dictionaries[language]?.[key] ?? en[key] ?? key;
}

export function voiceLang(language) {
  return {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    mr: "mr-IN",
  }[language] ?? "en-IN";
}
