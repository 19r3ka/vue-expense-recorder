<script setup lang="ts">
import { useDate } from 'vuetify'
import { useI18n } from '@/plugins/i18n'
import { computed } from 'vue'
import MyDatePicker from '@/components/MyDatePicker.vue'
// import { hours, minutes } from '@/data/time'

const adapter = useDate()
const { t } = useI18n()

const dateTime = defineModel<Date>({ required: true })

const selectedHour = computed(() => adapter.getHours(dateTime.value).toString().padStart(2, '0'))
const selectedMinute = computed(() =>
  adapter.getMinutes(dateTime.value).toString().padStart(2, '0')
)
const selectedTime = computed(() => `${selectedHour.value}:${selectedMinute.value}`)

/**
 * Checks if provided parameter could be a valid hour representation
 * @param hour
 */
const isValidHour = (hour: number) => !isNaN(hour) && hour >= 0 && hour <= 23

/**
 * Checks if provided parameter could be a valid minute representation
 * @param minute
 */
const isValidMinute = (minute: number) => !isNaN(minute) && minute >= 0 && minute <= 59

/**
 * Updates the time part of the dateTime model with the given hour and minute.
 * @param date The base Date object to update.
 * @param hour The hour value (0-23).
 * @param minute The minute value (0-59).
 */
const updateDateTime = (date: Date, time: string) => {
  const newDate = new Date(date.getTime()) // Create copy to avoid mutation
  const [hours, minutes] = time.split(':').map(Number)

  // TODO: Notify the user whenever the inputs (hours and minutes) are invalid
  if (isValidHour(hours) && isValidMinute(minutes)) newDate.setHours(hours, minutes)

  dateTime.value = newDate
}

/**
 * Sets the date to update the dateTime model.
 * @param date The new Date object to set.
 */
const setDate = (date: Date) => {
  updateDateTime(date, selectedTime.value)
}

/**
 * Sets the time to update the dateTime model.
 * @param date The new Date object to set.
 */
const setTime = (time: string) => {
  updateDateTime(dateTime.value, time)
}
</script>

<template>
  <v-row>
    <v-col>
      <my-date-picker
        :label="t('expenseForm.date')"
        :model-value="dateTime"
        @update:model-value="setDate"
      ></my-date-picker>
    </v-col>
    <v-col>
      <v-text-field
        :label="t('expenseForm.time')"
        type="time"
        :model-value="selectedTime"
        @update:model-value="setTime"
      ></v-text-field>
    </v-col>
  </v-row>
</template>
