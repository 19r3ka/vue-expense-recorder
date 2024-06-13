<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { categoryDetails } from '@/data/categories'
import { toCamelCase } from '@/utils/stringUtils'

import { useDateTime } from '@/composables/useDateTimeFunctions'

import type { Category } from '@/data/categories'
import type { Expense } from './ExpenseFormNew.vue'

const DEFAULT_CATEGORY_COLOR = 'green'
const DEFAULT_CATEGORY_ICON = 'mdi-receipt'
const props = defineProps<Expense>()

const { formatTime } = useDateTime()
const { t, n } = useI18n()

// TODO: move these functions to categoryUtils.js
const getCategoryColor = (category: Category) =>
  categoryDetails[category]?.color || DEFAULT_CATEGORY_COLOR
const getCategoryIcon = (category: Category) =>
  categoryDetails[category]?.icon || DEFAULT_CATEGORY_ICON

const color = computed(() => getCategoryColor(props.category as Category))
const icon = computed(() => getCategoryIcon(props.category as Category))
const categoryTranslationPath = computed(() => `categories.${toCamelCase(props.category)}`)
</script>
<template>
  <v-container>
    <v-row>
      <v-col class="d-flex flex-shrink-1 flex-grow-0 justify-center align-center pr-0">
        <v-icon :icon="icon" :class="`text-${color}-darken-2`"></v-icon>
      </v-col>
      <v-col class="flex-grow-1 flex-shrink-0">
        <v-row no-gutters class="justify-space-between">
          <v-col class="flex-grow-1 m-0 p-0">
            <p class="text-truncate text-h6 text-capitalize">
              {{ props.description }}
            </p>
          </v-col>

          <v-col class="m-0 p-0 d-flex align-center justify-end">
            <p class="font-weight-medium text-red-darken-1 text-right">
              -{{ n(props.amount) }} {{ props.currency }}
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters class="justify-space-between">
          <v-col class="m-0 p-0">
            <p class="text-caption" :class="`text-${color}-darken-2`">
              {{ t(categoryTranslationPath) }}
            </p>
          </v-col>

          <v-col class="m-0 p-0">
            <p class="text-caption text-grey-darken-1 text-right">
              {{ formatTime(props.datetime) }}
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
