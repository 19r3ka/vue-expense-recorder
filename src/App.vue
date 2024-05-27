<script setup lang="ts">
import AppShell from '@/components/AppShell.vue'
import NewExpenseForm from '@/components/ExpenseFormNew.vue'
import ExpensesList from '@/components/ExpensesList.vue'
</script>

<template>
  <app-shell>
    <Suspense>
      <template #fallback>
        <div>Loading...</div>
      </template>
      <expenses-list></expenses-list>
    </Suspense>
    <new-expense-form></new-expense-form>
  </app-shell>
</template>

<style scoped></style>
