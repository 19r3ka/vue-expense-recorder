import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { fr, en } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import i18n, { useI18n, SUPPORTED_LOCALES } from './i18n'

// define message schema for Vue component
type MessageSchema = typeof en

/**
 * Merges custom messages with Vuetify translations for a specific locale.
 *
 */
function addVuetifyMessages(locale: string, messages: Record<string, any>) {
  const vuetifyKey = '$vuetify'
  const availableLocaleMessages: Record<string, MessageSchema> = { en, fr }

  // Check if the chosen locale is available
  if (!availableLocaleMessages[locale]) {
    console.warn(`Locale "${locale}" not found in availableLocales. Falling back to default.`)
    locale = SUPPORTED_LOCALES[0]
  }

  const mergedMessages = { ...messages }
  mergedMessages[vuetifyKey] = availableLocaleMessages[locale]

  return mergedMessages
}

export { addVuetifyMessages }
export default () =>
  createVuetify({
    locale: { adapter: createVueI18nAdapter({ i18n, useI18n }) },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi
      }
    }
  })
