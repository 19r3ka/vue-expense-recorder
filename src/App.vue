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

    <v-dialog max-width="500">
      <template #activator="{ props: activatorProps }">
        <v-fab
          icon="mdi-plus"
          class="mx-6"
          location="bottom"
          size="small"
          color="primary"
          v-bind="activatorProps"
          absolute
          offset
        ></v-fab>
      </template>

      <template #default="{ isActive }">
        <v-card>
          <new-expense-form @expense-saved="isActive.value = false"></new-expense-form>
        </v-card>
      </template>
    </v-dialog>
  </app-shell>
</template>

<style scoped></style>
