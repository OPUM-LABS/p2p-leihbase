# Internationalization (i18n)

This application supports multiple languages using dedicated translation files per language.

## Language Files

All translations are located in `web/i18n/locales/`:
- [`en.json`](./locales/en.json) — English translations
- [`de.json`](./locales/de.json) — German translations

## How to Add a New Language

Adding a new language (e.g. French `fr`, Spanish `es`, etc.) takes just 2 simple steps:

### 1. Create the new locale file
Copy `web/i18n/locales/en.json` to `web/i18n/locales/<locale>.json` (e.g. `fr.json`) and translate the values.

```bash
cp web/i18n/locales/en.json web/i18n/locales/fr.json
```

### 2. Register the language
In [`web/i18n/i18n.config.ts`](./i18n.config.ts):
```ts
import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    de,
    fr,
  },
}));
```

In [`web/nuxt.config.ts`](../nuxt.config.ts):
```ts
  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English" },
      { code: "de", language: "de-DE", name: "Deutsch" },
      { code: "fr", language: "fr-FR", name: "Français" },
    ],
    // ...
  }
```

The language switcher in the navigation and footer will automatically include the new language!
