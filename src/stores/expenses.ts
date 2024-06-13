import { computed, onMounted, reactive } from 'vue'
import { defineStore } from 'pinia'
import { INDEXEDDB_ERROR_TYPES, useindexedDB } from '@/composables/useIndexedDB'
import type { Expense } from '@/components/ExpenseFormNew.vue'
import { IndexedDBError } from '@/errors/IndexedDBError'

const EXPENSE_STORE_NAME = 'expenses'
const NUMBER_OF_EXPENSES = 200

interface ExpenseState {
  loading: boolean
  error: IndexedDBError | null
  expenses: Expense[]
  cursor: string
}

const storeImplementation = () => {
  // define the state
  const state = reactive<ExpenseState>({
    loading: false,
    error: null,
    expenses: [],
    cursor: ''
  })

  // getters for state properties
  const getExpenses = computed(() => state.expenses)
  const isLoading = computed(() => state.loading)
  const error = computed(() => state.error)

  // actions
  async function createExpense(expense: Expense) {
    state.loading = true
    const { addItemsToStore } = await useindexedDB()

    if (!addItemsToStore) {
      state.error = new IndexedDBError(
        INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED,
        'addItemsToStore is not defined'
      )
      state.loading = false
      return null
    }

    try {
      const createdExpenses = await addItemsToStore(EXPENSE_STORE_NAME, expense)
      if (createdExpenses?.length) state.expenses.push(...createdExpenses)
      return createdExpenses
    } catch (error: any) {
      state.error =
        error instanceof IndexedDBError
          ? error
          : new IndexedDBError(INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED, error.message) // Handle unexpected errors
      throw error // Re-throw for potential UI handling
    } finally {
      state.loading = false
    }
  }

  async function readExpenses() {
    state.loading = true // Set loading state before operation
    const { getAllItemsFromStoreWithCursor } = await useindexedDB()

    if (!getAllItemsFromStoreWithCursor) {
      state.error = new IndexedDBError(
        INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED,
        'getAllItemsFromStoreWithCursor is not defined'
      )
      state.loading = false
      return
    }

    try {
      const retrievedExpenses = await getAllItemsFromStoreWithCursor(
        EXPENSE_STORE_NAME,
        NUMBER_OF_EXPENSES
      )

      if (retrievedExpenses?.length) {
        const lastItemIndex = (retrievedExpenses?.length ?? 0) - 1
        state.cursor = retrievedExpenses?.[lastItemIndex]?._id || state.cursor
        // state.expenses.splice(0, state.expenses.length, ...retrievedExpenses) // Efficient update
        state.expenses.length = 0
        state.expenses.push(...retrievedExpenses)
      }

      return retrievedExpenses
    } catch (error: any) {
      state.error =
        error instanceof IndexedDBError
          ? error
          : new IndexedDBError(INDEXEDDB_ERROR_TYPES.ITEM_RETRIEVAL_FAILED, error.message) // Handle unexpected errors
      throw error // Re-throw for potential UI handling
    } finally {
      state.loading = false // Clear loading state on success
    }
  }

  // hydrate the store on initiatilization
  onMounted(async () => {
    try {
      await readExpenses()
    } catch (error: any) {
      state.error =
        error instanceof IndexedDBError
          ? error
          : new IndexedDBError(INDEXEDDB_ERROR_TYPES.ITEM_RETRIEVAL_FAILED, error.message) // Handle unexpected errors
    }
  })

  // readExpenses()

  return { getExpenses, createExpense, readExpenses, isLoading, error }
}

export const useExpensesStore = defineStore('expenses', storeImplementation)
