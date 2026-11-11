# Internationalization (i18n) Scaffolding: English & Hindi

## Overview
This document outlines the internationalization architecture implemented for OpenSourceMate (Issue #202).

To support a global community of developers—including the vast open-source developer ecosystem in India—OpenSourceMate provides multi-language scaffolding supporting English (`en`) and Hindi (`hi`), with extensible JSON dictionaries for seamless additions of further locales.

## Architecture & Message Store

### 1. JSON Message Dictionaries (`frontend/messages/`)
All visible strings are externalized into namespace JSON dictionaries:
- `frontend/messages/en.json`: Canonical English strings.
- `frontend/messages/hi.json`: Full Hindi translations covering Navigation, Hero, How It Works, Profile Analyzer, and Footer.

### 2. React Context & Hook (`frontend/utils/i18n.tsx`)
- Provides `I18nProvider` and the custom hook `useI18n()`.
- Supports dot-delimited translation lookups with fallback values:
  ```tsx
  const { t } = useI18n();
  <h1>{t("hero.titlePrefix", "Turn your GitHub history into")}</h1>
  ```
- Automatically syncs the HTML document root attribute (`document.documentElement.lang = locale`) ensuring proper screen reader pronunciation and browser font rendering.
- Persists user language choice in browser `localStorage` under `preferred_locale`.

### 3. Language Switcher (`frontend/components/LanguageSwitcher.tsx`)
- Accessible dropdown with globe icon and screen-reader accessible label.
- Supports instant switching without full page refresh.

## Adding a New Language
To add a new language (e.g. Spanish `es` or French `fr`):
1. Create `frontend/messages/<locale>.json` modeled after `en.json`.
2. Register the locale in `frontend/utils/i18n.tsx` message registry.
3. Add the language option to `frontend/components/LanguageSwitcher.tsx`.

## Test Verification
- Tested via `frontend/__tests__/i18n.test.tsx` verifying:
  - English message rendering by default.
  - Runtime locale switching to Hindi.
  - HTML `lang` attribute updating to `hi`.
  - LocalStorage persistence and fallback behavior.
