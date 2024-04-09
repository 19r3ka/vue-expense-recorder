<template>
  <v-text-field
    id="calendar-activator"
    v-bind="$attrs"
    :model-value="displayDate"
    readonly
  ></v-text-field>
  <v-menu activator="#calendar-activator">
    <v-date-picker v-model="selectedDate" :max="defaultDate"></v-date-picker>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDate } from 'vuetify'

const adapter = useDate()
const defaultDate: Date = new Date()
const selectedDate = defineModel<Date>({ required: true })

const displayDate = computed<string>(() => adapter.format(selectedDate.value, 'yyyy/MM/dd'))
</script>
