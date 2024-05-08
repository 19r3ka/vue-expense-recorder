import { reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import {
  alpha,
  required,
  maxLength,
  minValue,
  between,
  numeric,
  length,
  notInFuture
} from '@/utils/i18n-validators'
import { type Expense } from '@/components/ExpenseFormNew.vue'

function useExpenseValidation(initialExpense: Expense) {
  const expense = reactive(initialExpense)

  const rules = computed(() => ({
    description: { required, maxLength: maxLength(100) },
    category: { required },
    datetime: { required, notInFuture },
    location: {
      required,
      latitude: { required, numeric, between: between(-90, 90) },
      longitude: { required, numeric, between: between(-180, 180) }
    },
    amount: { required, numeric, minValue: minValue(0) },
    currency: { required, alpha, length: length(3) }
  }))

  const v$ = useVuelidate(rules, expense)

  return { expense, v$ }
}

export { useExpenseValidation }
export default { useExpenseValidation }
