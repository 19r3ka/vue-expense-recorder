<script setup lang="ts">
import { computed, reactive, ref, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useExpenseValidation } from '@/composables/useVuelidate'
import { useExpensesStore } from '@/composables/useExpensesStore'

import { Category } from '@/data/categories'
import { currencyCodes, defaultCurrencyCode } from '@/data/currencies'
import { toCamelCase } from '@/utils/stringUtils'

import MyDateTimeInput from '@/components/MyDateTimeInput.vue'
import MyGeolocationInput, { type GeoPoint } from '@/components/MyGeolocationInput.vue'

// TODO: Implement new expense caching so the information remains in the form until submission

export interface Expense {
  _id?: string
  _rev?: string
  userId?: string
  description: string
  category: string
  datetime: Date
  location: GeoPoint
  amount: number
  currency: string
  _createdAt?: Date
  _editedAt?: Date
}

const { t } = useI18n()
const { createExpense } = useExpensesStore()

const initialExpense: Expense = reactive({
  description: '',
  category: '',
  datetime: new Date(),
  location: { longitude: -Infinity, latitude: -Infinity },
  amount: 0,
  currency: defaultCurrencyCode
})

const showCurrencySelection = ref(false)

const { expense, v$ } = useExpenseValidation(initialExpense)

provide('v$', v$)

const categoryItems = computed(() =>
  Object.keys(Category).map((category) => ({
    title: t(`categories.${toCamelCase(category)}`),
    value: category
  }))
)
const currencyItems = computed(() => currencyCodes)
const amountLabel = computed(() => t('expenseForm.amount'))
const currencyLabel = computed(() => t('expenseForm.currency'))
const isValid = computed(() => {
  // Add your form validation logic here
  return expense.description && expense.amount && expense.category
})

async function saveChanges() {
  const formValid = await v$.value.$validate()
  if (!formValid) return
  try {
    const savedDoc = await createExpense(expense)
    console.log('Expense successfully saved: ', savedDoc)
    v$.value.$reset
  } catch (error) {
    console.log('something went terribly wrong', error)
  }
}
</script>

<template>
  <v-container class="justify-center">
    <v-form @submit.prevent="saveChanges">
      <v-card class="mb-3" variant="tonal" :title="t('expenseForm.title')">
        <v-card-text>
          {{ t('expenseForm.instructions') }}
        </v-card-text>
      </v-card>

      <my-geolocation-input
        v-model="v$.location.$model"
        @location-changed="v$.location.$touch"
        :error-messages="v$.location.$errors.map((e) => e.$message) as string[]"
      ></my-geolocation-input>

      <v-text-field
        :label="t('expenseForm.description')"
        v-model="v$.description.$model"
        :error-messages="v$.description.$errors.map((e) => e.$message) as string[]"
        @blur="v$.description.$touch"
        @input="v$.description.$touch"
      ></v-text-field>

      <v-row>
        <v-col>
          <v-text-field
            :label="amountLabel"
            type="number"
            v-model.number="v$.amount.$model"
            :error-messages="v$.amount.$errors.map((e) => e.$message) as string[]"
            :suffix="expense.currency"
            append-icon="mdi-pencil"
            @click:append="showCurrencySelection = true"
            required
            @blur="v$.amount.$touch"
            @input="v$.amount.$touch"
          ></v-text-field>
        </v-col>

        <v-col v-if="showCurrencySelection">
          <v-autocomplete
            :label="currencyLabel"
            :items="currencyItems"
            v-model="v$.currency.$model"
            @update:model-value="showCurrencySelection = false"
            :error-messages="v$.currency.$errors.map((e) => e.$message) as string[]"
            required
            @blur="v$.currency.$touch"
            @input="v$.currency.$touch"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-select
        :label="t('expenseForm.category')"
        v-model="v$.category.$model"
        :items="categoryItems"
        :error-messages="v$.category.$errors.map((e) => e.$message) as string[]"
        required
        @blur="v$.category.$touch"
        @input="v$.category.$touch"
      ></v-select>

      <my-date-time-input
        v-model="v$.datetime.$model"
        :error-messages="v$.datetime.$errors.map((e) => e.$message) as string[]"
      ></my-date-time-input>

      <v-btn type="submit" :disabled="!isValid" color="success" size="large" block class="mt-5">{{
        t('expenseForm.save')
      }}</v-btn>
    </v-form>
  </v-container>
</template>
