<script setup lang="ts">
import { computed, ref } from 'vue'
import { inject } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { VAutocomplete } from 'vuetify/components'
import { useGeocoding, type NominatimResponseItem } from '@/composables/useGeocoding'
import { useGeolocation, GEOLOCATION_ERROR_TYPES } from '@/composables/useGeolocation'
import { type GeoPoint } from '@/components/MyGeolocationInput.vue'
import { formatGeopoint } from '@/utils/geopointUtils'
import { useLogger } from '@/composables/useLogger'

export interface AutocompleteItem {
  title: string // The displayed text for the option
  value: string | number | object // The actual value associated with the option
}

export type AutocompleteItems = AutocompleteItem[]
export type NominatimResponse = NominatimResponseItem[]

defineOptions({ inheritAttrs: false })
const emit = defineEmits<{
  addressFound: [position: GeoPoint]
}>()

const DEFAULT_LOCATE_ME_ICON = 'mdi-crosshairs'
const DEBOUNCE_TIME = 1000

const v$ = inject('v$') as any

const { t } = useI18n()
const { isLoading, searchNominatim, searchResults } = useGeocoding()
const { coords, error } = useGeolocation()
const logger = useLogger()

const selectedAddress = ref('')
const searchInput = ref<InstanceType<typeof VAutocomplete> | null>(null) // template ref for the address search bar
const userEnteredAddress = ref('')

const potentialAddresses = computed(() =>
  searchResults.map((result) => ({
    title: result.display_name,
    value: formatGeopoint({ latitude: Number(result.lat), longitude: Number(result.lon) }, 'string')
  }))
)

// only display the "locate me" button when geolocation is supported and enabled
const locateMeIcon = computed(() =>
  [GEOLOCATION_ERROR_TYPES.NOT_SUPPORTED, GEOLOCATION_ERROR_TYPES.PERMISSION_DENIED].includes(
    error.value?.type as GEOLOCATION_ERROR_TYPES
  )
    ? ''
    : DEFAULT_LOCATE_ME_ICON
)

// permission should be denied when there is no accuracy
// const locateMeIcon = computed(() => (coords.value?.accuracy === 0 ? '' : DEFAULT_LOCATE_ME_ICON))

const debouncedQuerySearch = useDebounceFn(fetchPotentialAddresses, DEBOUNCE_TIME)

/**
 * Fetches potential address matches based on a user query string.
 *
 * This function fetches data from an external API and populates the `potentialAddresses` array with formatted results suitable for an autocomplete component.
 *
 * @param {string} query - The user's search query string.
 * @returns {Promise<void>} - Resolves after fetching and processing the data, or rejects on error.
 */
async function fetchPotentialAddresses(query: string) {
  if (!query) return null
  const searchOptions = { q: query }

  try {
    await searchNominatim(searchOptions)
  } catch (error: any) {
    logger.error(error.value.message, error.value)
  }
}

/**
 * Triggers a debounced search for potential addresses.
 *
 * This function marks the UI as loading by setting `loading.value` to `true`. It then calls the `debouncedQuerySearch` function, passing the current user-entered address (`userEnteredAddress.value`) as an argument.
 *
 * Debounced search ensures that the API request for potential addresses is not triggered with every keystroke, but rather after a defined delay from the last user input. This helps optimize performance and avoid overwhelming the server with unnecessary requests.
 */
function handleDebouncedSearch() {
  if (!searchInput.value?.focused) return null
  debouncedQuerySearch(userEnteredAddress.value)
}

/**
 * Updates the component's internal state with a new position based on a provided location string.
 */
function updatePosition(locationString: string) {
  if (!locationString) return null
  const geopoint = formatGeopoint(locationString, 'object') as GeoPoint
  emit('addressFound', geopoint)
}

function getDevicePosition() {
  if (error.value) {
    logger.error(error.value.message, error)
    return null
  }

  const { latitude, longitude } = coords.value
  const geopointAsString = formatGeopoint({ latitude, longitude }, 'string') as string

  updatePosition(geopointAsString)
}
</script>

<template>
  <v-autocomplete
    ref="searchInput"
    v-model:search.lazy="userEnteredAddress"
    :model-value="selectedAddress"
    :items="potentialAddresses"
    @update:search="handleDebouncedSearch"
    @update:model-value="updatePosition"
    :label="t('geolocation.searchPosition')"
    :loading="isLoading"
    no-filter
    :append-icon="locateMeIcon"
    @click:append="getDevicePosition"
    @blur="v$.location.$touch"
    @input="v$.location.$touch"
  ></v-autocomplete>
</template>
