<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useGeolocation } from '@vueuse/core'
import { useGeocoding, type NominatimResponseItem } from '@/composables/useGeocoding'
import { type GeoPoint } from '@/components/MyGeolocationInput.vue'
import { VAutocomplete } from 'vuetify/components'
import { formatGeopoint } from '@/utils/geopointUtils'

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
const { t } = useI18n()

const { isLoading, searchNominatim, searchResults } = useGeocoding()
const { isSupported, coords, error } = useGeolocation()

const selectedAddress = ref('')
const searchInput = ref<InstanceType<typeof VAutocomplete> | null>(null) // template ref for the address search bar
const userEnteredAddress = ref('')

const potentialAddresses = computed(() =>
  searchResults.map((result) => ({
    title: result.display_name,
    value: formatGeopoint({ latitude: Number(result.lat), longitude: Number(result.lon) }, 'string')
  }))
)

const locateMeIcon = computed(() =>
  coords.value.latitude !== Infinity && coords.value.longitude !== Infinity ? 'mdi-crosshairs' : ''
)

const debouncedQuerySearch = useDebounceFn(fetchPotentialAddresses, 1000)

/**
 * Fetches potential address matches based on a user query string.
 *
 * This function fetches data from an external API and populates the `potentialAddresses` array with formatted results suitable for an autocomplete component.
 *
 * @param {string} query - The user's search query string.
 * @returns {Promise<void>} - Resolves after fetching and processing the data, or rejects on error.
 */
async function fetchPotentialAddresses(query: string): Promise<void> {
  if (!query) return
  const searchOptions = { q: query }
  await searchNominatim(searchOptions)
}

/**
 * Triggers a debounced search for potential addresses.
 *
 * This function marks the UI as loading by setting `loading.value` to `true`. It then calls the `debouncedQuerySearch` function, passing the current user-entered address (`userEnteredAddress.value`) as an argument.
 *
 * Debounced search ensures that the API request for potential addresses is not triggered with every keystroke, but rather after a defined delay from the last user input. This helps optimize performance and avoid overwhelming the server with unnecessary requests.
 */
function handleDebouncedSearch(): void {
  if (!searchInput.value?.focused) return
  debouncedQuerySearch(userEnteredAddress.value)
}

/**
 * Updates the component's internal state with a new position based on a provided location string.
 */
function updatePosition(locationString: string): void {
  const geopoint = formatGeopoint(locationString, 'object') as GeoPoint
  emit('addressFound', geopoint)
}

function getDevicePosition() {
  if (!isSupported.value) {
    console.error('Geolocation is not supported by your browser')
    return
  }

  if (error.value) {
    console.error('Failed to get current location:', error.value)
    return
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
  ></v-autocomplete>
</template>
