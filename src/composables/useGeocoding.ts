import { ref, reactive } from 'vue'
import { EARTH_CIRCUMFERENCE, NOMINATIM_API_URL } from '@/config/geocoding'
import { useLogger } from '@/composables/useLogger'
import { GeocodingError } from '@/errors/GeocodingError'

// Error message constants for i18n integration
export enum GEOCODING_ERROR_TYPES {
  API_REQUEST_FAILED = 'apiRequestFailed',
  EMPTY_QUERY = 'emptyQuery'
}

export const GEOCODING_ERROR_MESSAGES = {
  [GEOCODING_ERROR_TYPES.API_REQUEST_FAILED]: 'errors.geocoding.apiRequestFailed',
  [GEOCODING_ERROR_TYPES.EMPTY_QUERY]: 'errors.geocoding.emptyQuery'
}

export interface NominatimSearchOptions {
  q: string // Free-form text query for location
  format?: 'json' | 'jsonv2' | 'xml' | 'geojson' | 'geocodejson' // Allowed formats
  json_callback?: string
  limit?: number
  addressdetails?: number
  extratags?: number
  namedetails?: number
  'accept-language'?: string
  countrycodes?: string
  featureType?: NomimatimSearchOptionsFeatureType
  exclude_place_ids?: string
  viewbox?: string
  bounded?: number
  polygon_threshold?: number
  email?: string
  dedupe?: number
}

export enum NomimatimSearchOptionsFeatureType {
  country = 'country',
  state = 'state',
  city = 'city',
  settlement = 'settlement'
}

export interface NominatimAddress {
  ISO3166_2_lvl4: string
  borough: string
  city: string
  country: string
  country_code: string
  neighbourhood: string
  postcode: string
  road: string
  suburb: string
  shop?: string
  historic?: string
  house_number?: string
}

export interface NominatimResponseItem {
  address: NominatimAddress
  boundingbox: number[]
  display_name: string
  importance: number
  lat: string
  licence: string
  lon: string
  osm_id: number
  osm_type: string
  place_id: number
  class?: string
  shop?: string
  addresstype?: string
  svg?: string
  name?: string
  place_rank?: number
  type?: string
}

export interface BoundingBox {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

export type NominatimSearchResult = NominatimResponseItem[]

/**
 * @function useGeocoding
 * @returns {Object} The geocoding composable
 * @property {import('vue').Ref<boolean>} isLoading - A ref indicating if the search is loading
 * @property {import('vue').Ref<Error|null>} error - A ref to an error object if an error occurred
 * @property {import('vue').Reactive<NominatimSearchResult>} searchResults - A reactive array of search results
 * @property {function(NominatimSearchOptions): Promise<void>} searchNominatim - A function to perform a Nominatim search
 * @property {function({lat: number, lng: number}, number): BoundingBox} calculateBoundingBox - A function to calculate a bounding box
 */
export function useGeocoding() {
  const isLoading = ref(false)
  const error = ref<GeocodingError | null>(null)
  const searchResults = reactive<NominatimSearchResult>([])

  const { error: logError } = useLogger()

  async function searchNominatim(options: NominatimSearchOptions) {
    isLoading.value = true
    error.value = null
    searchResults.length = 0 // reset search results

    options.format ||= 'jsonv2' // Set format to "jsonv2" if it doesn't exist
    options.limit ||= 5 // Set limit to 5 if it doesn't exist
    const endpoint = 'search'

    if (!options.q)
      throw new GeocodingError(
        GEOCODING_ERROR_TYPES.EMPTY_QUERY,
        GEOCODING_ERROR_MESSAGES[GEOCODING_ERROR_TYPES.EMPTY_QUERY]
      )

    try {
      //   URLSearchParams expects Record<string, string>
      const stringifiedOptions = Object.fromEntries(
        Object.entries(options)
          .filter((option) => option[1] !== undefined)
          .map(([key, value]) => [key, String(value)])
      )

      const params = new URLSearchParams(stringifiedOptions)

      const response = await fetch(`${NOMINATIM_API_URL}${endpoint}?${params.toString()}`)
      if (!response.ok) {
        throw new GeocodingError(
          GEOCODING_ERROR_TYPES.API_REQUEST_FAILED,
          `Nominatim API request failed with status: ${response.status}`
        )
      }

      const data = await response.json()
      data.forEach((value: NominatimResponseItem) => {
        searchResults.push(value)
      })
    } catch (err) {
      error.value = err as GeocodingError
      logError(GEOCODING_ERROR_MESSAGES[GEOCODING_ERROR_TYPES.API_REQUEST_FAILED], err) // Log the error with details using the logger
    } finally {
      isLoading.value = false
    }
  }

  function calculateBoundingBox(center: { lat: number; lng: number }, radius: number): BoundingBox {
    const metersPerDegree = EARTH_CIRCUMFERENCE / 360

    const halfDistance = radius / 2
    const degreesPerMeter = 1 / metersPerDegree
    const deltaLatitude = halfDistance * degreesPerMeter
    const deltaLongitude = deltaLatitude / Math.cos((Math.PI * center.lat) / 180)

    return {
      xmin: center.lng - deltaLongitude,
      xmax: center.lng + deltaLongitude,
      ymin: center.lat - deltaLatitude,
      ymax: center.lat + deltaLatitude
    }
  }

  return {
    isLoading,
    error,
    searchResults,
    searchNominatim,
    calculateBoundingBox
  }
}
