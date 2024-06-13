import {
  GEOLOCATION_ERROR_MESSAGES,
  type GEOLOCATION_ERROR_TYPES
} from '@/composables/useGeolocation'
import { BaseError } from './BaseError'

// GeolocationError extends BaseError
export class GeolocationError extends BaseError {
  constructor(type: GEOLOCATION_ERROR_TYPES, message?: string, context?: string) {
    super(type, message || GEOLOCATION_ERROR_MESSAGES[type], 'GeolocationError', context)
  }
}
