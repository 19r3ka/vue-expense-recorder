import { type I18nOptions } from 'vue-i18n'

export const SUPPORTED_LOCALES: string[] = ['en', 'fr']

export const options: I18nOptions = {
  legacy: false,
  locale: SUPPORTED_LOCALES[0],
  fallbackLocale: SUPPORTED_LOCALES[1],
  messages: {}
}
