<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MyGeocoderInput from '@/components/MyGeocoderInput.vue'
import MyGeolocationMap from '@/components/MyGeolocationMap.vue'

export interface GeoPoint {
  /**
   * Longitude coordinate of the geographical point.
   */
  longitude: number

  /**
   * Latitude coordinate of the geographical point.
   */
  latitude: number
}

const expensePosition = defineModel<GeoPoint>({ required: true })

const { t } = useI18n()

const showMap = computed(
  () => expensePosition.value.latitude !== Infinity && expensePosition.value.longitude !== Infinity
)

function updatePosition(newPosition: GeoPoint) {
  expensePosition.value.latitude = newPosition.latitude
  expensePosition.value.longitude = newPosition.longitude
}
</script>

<template>
  <v-card class="expense-location my-5">
    <v-card-item>
      <v-card-title>{{ t('expenseForm.location') }}</v-card-title>
    </v-card-item>

    <v-card-text>
      <my-geolocation-map
        v-if="showMap"
        :model-value="expensePosition"
        @update:model-value="updatePosition"
      ></my-geolocation-map>

      <my-geocoder-input
        id="expense-location-input"
        @address-found="updatePosition"
      ></my-geocoder-input>
    </v-card-text>
  </v-card>
</template>
