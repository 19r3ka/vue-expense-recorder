<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ExpenseListItem from '@/components/ExpensesListItem.vue'

import { useExpensesStore } from '@/stores/expenses'
import { useDateTime, SortDirection } from '@/composables/useDateTimeFunctions'
import { useLogger } from '@/composables/useLogger'

const { getExpenses, error } = useExpensesStore()
const { formatDate, groupItemsByDate, sortItemsByTime } = useDateTime()
const { error: logError } = useLogger()

const expenses = getExpenses

const sortDirection = ref(SortDirection.ASC)

// Computed property for grouped and sorted expenses
const groupedExpenses = computed(() => {
  const groups = groupItemsByDate(expenses)
  return Object.entries(groups).map(([date, items]) => ({
    date,
    items: sortItemsByTime(items, sortDirection.value as SortDirection)
  }))
})

// Watch for changes in the error ref and log them
watch(
  () => error,
  (newError) => {
    if (newError) {
      logError(newError.message, newError)
    }
  }
)
</script>

<template>
  <v-container>
    <v-virtual-scroll :items="groupedExpenses">
      <template #default="{ item }">
        <v-container fluid>
          <v-row>
            <v-col>
              <h5 class="text-grey-darken-1 mb-1 text-capitalize">
                {{ formatDate(new Date(item.date)) }}
              </h5>
              <v-divider></v-divider>
              <expense-list-item
                v-for="expense in item.items"
                :key="expense._id"
                v-bind="expense"
              ></expense-list-item>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </v-virtual-scroll>
  </v-container>
</template>
