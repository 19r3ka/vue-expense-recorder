import { ref } from 'vue'
import { useindexedDB } from './useIndexedDB'
import type { Expense } from '@/components/ExpenseFormNew.vue'

const EXPENSE_STORE_NAME = 'expenses'
const error = ref('')

const { addItemsToStore } = useindexedDB()

export function useExpensesStore() {
  return {
    async createExpense(expense: Expense) {
      try {
        const res = await addItemsToStore(EXPENSE_STORE_NAME, expense)
        console.log('Adding items result', res)
      } catch (err: any) {
        error.value = err
        console.log(error.value)
      }
    }
  }
}
