import { ref } from 'vue'
import { useindexedDB } from './useIndexedDB'
import type { Expense } from '@/components/ExpenseFormNew.vue'

const EXPENSE_STORE_NAME = 'expenses'
const error = ref('')

const { addItemsToStore, getAllItemsFromStoreWithCursor } = useindexedDB()

export function useExpensesStore() {
  return {
    async createExpense(expense: Expense) {
      try {
        const createdExpense = await addItemsToStore(EXPENSE_STORE_NAME, expense)
        return createdExpense
      } catch (err: any) {
        error.value = err
        console.log(error.value)
      }
    },

    async readExpenses() {
      try {
        const retrievedExpenses = await getAllItemsFromStoreWithCursor(EXPENSE_STORE_NAME, 100)
        return retrievedExpenses
      } catch (err: any) {
        error.value = err
        console.log(error.value)
      }
    }
  }
}
