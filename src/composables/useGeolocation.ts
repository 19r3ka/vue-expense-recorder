import { onMounted, ref, watch, onUnmounted } from 'vue'
import { useGeolocation as vueUseGeolocation } from '@vueuse/core'
import { GeolocationError } from '@/errors/GeolocationError'
import type { GeoPoint } from '@/components/MyGeolocationInput.vue'

export enum GEOLOCATION_ERROR_TYPES {
  NOT_SUPPORTED = 'notSupported',
  PERMISSION_DENIED = 'permissionDenied',
  POSITION_UNAVAILABLE = 'positionUnavailable',
  TIMEOUT = 'timeout',
  INVALID_COORDS = 'invalidCoords',
  UNKNOWN_ERROR = 'unknownError'
}

export const GEOLOCATION_ERROR_MESSAGES = {
  [GEOLOCATION_ERROR_TYPES.NOT_SUPPORTED]: 'errors.geolocation.notSupported',
  [GEOLOCATION_ERROR_TYPES.PERMISSION_DENIED]: 'errors.geolocation.permissionDenied',
  [GEOLOCATION_ERROR_TYPES.POSITION_UNAVAILABLE]: 'errors.geolocation.positionUnavailable',
  [GEOLOCATION_ERROR_TYPES.TIMEOUT]: 'errors.geolocation.timeout',
  [GEOLOCATION_ERROR_TYPES.INVALID_COORDS]: 'errors.geolocation.invalidCoords',
  [GEOLOCATION_ERROR_TYPES.UNKNOWN_ERROR]: 'errors.geolocation.unknownError'
}

const ERROR_CODE_TO_TYPE: Record<number, GEOLOCATION_ERROR_TYPES> = {
  1: GEOLOCATION_ERROR_TYPES.PERMISSION_DENIED,
  2: GEOLOCATION_ERROR_TYPES.POSITION_UNAVAILABLE,
  3: GEOLOCATION_ERROR_TYPES.TIMEOUT
}

export function isValidCoords(coords: GeoPoint) {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  )
}

export function useGeolocation() {
  const error = ref<GeolocationError | null>(null)
  const { isSupported, coords, error: geolocationError } = vueUseGeolocation()

  const setError = (type: GEOLOCATION_ERROR_TYPES) => {
    error.value = new GeolocationError(type, GEOLOCATION_ERROR_MESSAGES[type])
  }

  const stopWatchGeolocationError = watch(geolocationError, (newError) => {
    if (newError?.code) {
      const errorType = ERROR_CODE_TO_TYPE[newError.code] || GEOLOCATION_ERROR_TYPES.UNKNOWN_ERROR
      setError(errorType)
    } else {
      error.value = null
    }
  })

  const stopWatchCoords = watch(coords, (newCoords) => {
    if (!isValidCoords(newCoords)) {
      setError(GEOLOCATION_ERROR_TYPES.INVALID_COORDS)
    } else {
      error.value = null
    }
  })

  onMounted(() => {
    if (!isSupported.value) {
      setError(GEOLOCATION_ERROR_TYPES.NOT_SUPPORTED)
    }
  })

  onUnmounted(() => {
    stopWatchGeolocationError()
    stopWatchCoords()
  })

  return {
    coords,
    error
  }
}
