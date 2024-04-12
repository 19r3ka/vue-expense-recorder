<script setup lang="ts">
import { ref } from 'vue'
import LangSwitch from '@/components/MyLanguageSwitch.vue'

const appTitle = ref<string>('Scrooge')
</script>

<template>
  <v-app dark>
    <v-app-bar app dense dark elevated>
      <v-app-bar-title>{{ appTitle }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <lang-switch></lang-switch>
    </v-app-bar>
    <v-main>
      <slot></slot>
    </v-main>
  </v-app>
</template>

<style></style>
