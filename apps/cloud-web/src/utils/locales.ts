/**
 * ISO 639-1 language codes with their display names
 * Used for locale selection in profile settings
 */

export interface Locale {
  code: string;
  name: string;
}

export const LOCALES: Locale[] = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'az', name: 'Azerbaijani (Azərbaycan)' },
  { code: 'be', name: 'Belarusian (Беларуская)' },
  { code: 'bg', name: 'Bulgarian (Български)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'bs', name: 'Bosnian (Bosanski)' },
  { code: 'ca', name: 'Catalan (Català)' },
  { code: 'cs', name: 'Czech (Čeština)' },
  { code: 'cy', name: 'Welsh (Cymraeg)' },
  { code: 'da', name: 'Danish (Dansk)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'el', name: 'Greek (Ελληνικά)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'et', name: 'Estonian (Eesti)' },
  { code: 'eu', name: 'Basque (Euskara)' },
  { code: 'fa', name: 'Persian (فارسی)' },
  { code: 'fi', name: 'Finnish (Suomi)' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'ga', name: 'Irish (Gaeilge)' },
  { code: 'gl', name: 'Galician (Galego)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'hr', name: 'Croatian (Hrvatski)' },
  { code: 'hu', name: 'Hungarian (Magyar)' },
  { code: 'hy', name: 'Armenian (Հայերեն)' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)' },
  { code: 'is', name: 'Icelandic (Íslenska)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ka', name: 'Georgian (ქართული)' },
  { code: 'kk', name: 'Kazakh (Қазақша)' },
  { code: 'km', name: 'Khmer (ខ្មែរ)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'lo', name: 'Lao (ລາວ)' },
  { code: 'lt', name: 'Lithuanian (Lietuvių)' },
  { code: 'lv', name: 'Latvian (Latviešu)' },
  { code: 'mk', name: 'Macedonian (Македонски)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mn', name: 'Mongolian (Монгол)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)' },
  { code: 'mt', name: 'Maltese (Malti)' },
  { code: 'my', name: 'Burmese (မြန်မာ)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'no', name: 'Norwegian (Norsk)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'pl', name: 'Polish (Polski)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ro', name: 'Romanian (Română)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'si', name: 'Sinhala (සිංහල)' },
  { code: 'sk', name: 'Slovak (Slovenčina)' },
  { code: 'sl', name: 'Slovenian (Slovenščina)' },
  { code: 'sq', name: 'Albanian (Shqip)' },
  { code: 'sr', name: 'Serbian (Српски)' },
  { code: 'sv', name: 'Swedish (Svenska)' },
  { code: 'sw', name: 'Swahili (Kiswahili)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'uk', name: 'Ukrainian (Українська)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'uz', name: 'Uzbek (Oʻzbekcha)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'zu', name: 'Zulu (isiZulu)' },
];

/**
 * Get the display name for a locale code
 * @param code ISO 639-1 language code
 * @returns Display name or the code if not found
 */
export const getLocaleName = (code: string): string => {
  const locale = LOCALES.find((l) => l.code === code);
  return locale ? locale.name : code;
};

/**
 * Get all locale codes
 * @returns Array of locale codes
 */
export const getLocaleCodes = (): string[] => {
  return LOCALES.map((l) => l.code);
};
