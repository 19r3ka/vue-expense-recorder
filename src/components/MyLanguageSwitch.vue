<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, SUPPORTED_LOCALES, switchLocale } from '@/plugins/i18n'

const { t, locale } = useI18n()

const availableLocale = computed(
  () => SUPPORTED_LOCALES.find((l) => l !== locale.value) || SUPPORTED_LOCALES[0]
)

const availableLocaleName = computed(() => t(`language.${availableLocale.value}`))

function handleSwitchLocale() {
  if (availableLocale.value) {
    switchLocale(availableLocale.value)
  }
}
</script>

<template>
  <v-btn v-if="availableLocale" @click="handleSwitchLocale">{{
    t('language.switch_lang', { lang: availableLocaleName })
  }}</v-btn>
</template>
