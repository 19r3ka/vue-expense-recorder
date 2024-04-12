<script setup lang="ts">
import { useDate } from 'vuetify'
import { computed } from 'vue'
import MyDatePicker from '@/components/MyDatePicker.vue'
import { hours, minutes } from '@/data/time'

const adapter = useDate()

const dateTime = defineModel<Date>({ required: true })

const selectedHour = computed(() => adapter.getHours(dateTime.value).toString().padStart(2, '0'))
const selectedMinute = computed(() =>
  adapter.getMinutes(dateTime.value).toString().padStart(2, '0')
)

/**
 * Updates the time part of the dateTime model with the given hour and minute.
 * @param date The base Date object to update.
 * @param hour The hour value (0-23).
 * @param minute The minute value (0-59).
 */
const updateTime = (date: Date, hour: number, minute: number) => {
  const newDate = new Date(date.getTime()) // Create copy to avoid mutation
  newDate.setHours(hour)
  newDate.setMinutes(minute)
  dateTime.value = newDate
}

/**
 * Sets the date and time in the dateTime model.
 * @param date The new Date object to set.
 */
const setDate = (date: Date) => {
  updateTime(date, +selectedHour.value, +selectedMinute.value)
}

/**
 * Sets the hour in the dateTime model.
 * @param hour The hour value (string representation).
 */
const setHour = (hour: string) => {
  const parsedHour = parseInt(hour, 10)
  if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour <= 23) {
    updateTime(dateTime.value, parsedHour, +selectedMinute.value)
  }
}

/**
 * Sets the minute in the dateTime model.
 * @param minute The minute value (string representation).
 */
const setMinute = (minute: string) => {
  const parsedMinute = parseInt(minute, 10)
  if (!isNaN(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59) {
    updateTime(dateTime.value, +selectedHour.value, parsedMinute)
  }
}
</script>

<template>
  <v-row>
    <v-col>
      <my-date-picker
        label="Date"
        :model-value="dateTime"
        @update:model-value="setDate"
      ></my-date-picker>
    </v-col>
    <v-col>
      <v-combobox
        label="Hour"
        :model-value="selectedHour"
        @update:model-value="setHour"
        :items="hours"
      ></v-combobox>
    </v-col>
    <v-col>
      <v-combobox
        label="Minute"
        :model-value="selectedMinute"
        @update:model-value="setMinute"
        :items="minutes"
      ></v-combobox>
    </v-col>
  </v-row>
</template>
