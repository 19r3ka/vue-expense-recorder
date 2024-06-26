<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  GEOLOCATION_ERROR_MESSAGES,
  GEOLOCATION_ERROR_TYPES,
  isValidCoords,
  useGeolocation
} from '@/composables/useGeolocation'
import MyGeocoderInput from '@/components/MyGeocoderInput.vue'
import MyGeolocationMap from '@/components/MyGeolocationMap.vue'
import MyMapErrorDisplay from '@/components/MyMapErrorDisplay.vue'

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

const props = defineProps({
  errorMessages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits<{
  locationChanged: [position: GeoPoint]
}>()

const { t } = useI18n()
const { error: geolocationError } = useGeolocation()

const DEFAULT_GEOLOCATION_ERROR_ICON = 'mdi-map-marker-off'
const DEFAULT_GEOLOCATION_ERROR_TEXT = 'errors.geolocation.defaultMessage'

const mapError = computed(() => {
  const response = reactive({
    icon: DEFAULT_GEOLOCATION_ERROR_ICON,
    title: t(DEFAULT_GEOLOCATION_ERROR_TEXT),
    text: '',
    action: null
  })

  // account for when expensePosition has not yet been set.
  // not returning allows for other errors to have priority
  if (!isValidCoords(expensePosition.value)) {
    response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.INVALID_COORDS])
  }

  if (!geolocationError.value) return response

  switch (geolocationError.value.type) {
    case GEOLOCATION_ERROR_TYPES.PERMISSION_DENIED:
      response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.PERMISSION_DENIED])
      break
    case GEOLOCATION_ERROR_TYPES.NOT_SUPPORTED:
      response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.NOT_SUPPORTED])
      break
    case GEOLOCATION_ERROR_TYPES.POSITION_UNAVAILABLE:
      response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.POSITION_UNAVAILABLE])
      break
    case GEOLOCATION_ERROR_TYPES.INVALID_COORDS:
      response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.INVALID_COORDS])
      break
    case GEOLOCATION_ERROR_TYPES.TIMEOUT:
      response.text = t(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERROR_TYPES.TIMEOUT])
      break
  }

  return response
})

// if there is a text to display it is most likely because an error occured
const showError = computed(() => !!mapError.value.text)

function updatePosition(newPosition: GeoPoint) {
  expensePosition.value.latitude = newPosition.latitude
  expensePosition.value.longitude = newPosition.longitude
  emit('locationChanged', expensePosition.value)
}
</script>

<template>
  <v-card class="expense-location my-5" :class="{ 'text-red-darken-4': !!errorMessages.length }">
    <v-card-item>
      <v-card-subtitle>{{ t('expenseForm.location') }}</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <transition name="fade">
        <my-map-error-display v-if="showError" v-bind="mapError"></my-map-error-display>

        <my-geolocation-map
          v-else
          :model-value="expensePosition"
          @update:model-value="updatePosition"
        ></my-geolocation-map>
      </transition>

      <my-geocoder-input
        id="expense-location-input"
        @address-found="updatePosition"
      ></my-geocoder-input>

      <div transition="slide-y-transition" v-if="!!props.errorMessages.length">
        <p class="text-caption" v-for="(error, index) in props.errorMessages" :key="index">
          {{ error }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>
