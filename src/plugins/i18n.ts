import { createI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, options } from '@/config/i18n'
import { addVuetifyMessages } from './vuetify'

// first type below is for legacy thus the use of Composition API.
// cf. https://vue-i18n.intlify.dev/guide/advanced/typescript#global-resource-schema-type-definition
const i18n = createI18n<false, typeof options>(options)
await loadLocaleMessages(i18n.global.locale.value)

async function loadLocaleMessages(locale: string) {
  const i18nMessages = await import(`@/locales/${locale}.json`)
  const messages = addVuetifyMessages(locale, i18nMessages)
  i18n.global.setLocaleMessage(locale, messages)
}

async function switchLocale(locale: string) {
  if (!i18n.global.availableLocales.includes(locale)) await loadLocaleMessages(locale)
  i18n.global.locale.value = locale

  // specify the language on the DOM
  document.querySelector('html')?.setAttribute('lang', locale)

  // add specific language headings for the "fetch" API or axios....
}

export default i18n
export * from 'vue-i18n'
export { i18n, loadLocaleMessages, switchLocale, SUPPORTED_LOCALES }
