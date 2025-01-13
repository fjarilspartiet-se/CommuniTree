// src/lib/i18n/index.ts
import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

const defaultLocale = 'en';

register('en', () => import('./en.json'));
register('sv', () => import('./sv.json'));

init({
  fallbackLocale: defaultLocale,
  initialLocale: defaultLocale
});
