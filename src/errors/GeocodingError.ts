import { GEOCODING_ERROR_MESSAGES, type GEOCODING_ERROR_TYPES } from '@/composables/useGeocoding'
import { BaseError } from './BaseError'

// GeocodingError extends BaseError
export class GeocodingError extends BaseError {
  constructor(type: GEOCODING_ERROR_TYPES, message?: string, context?: string) {
    super(type, message || GEOCODING_ERROR_MESSAGES[type], 'GeocodingError', context)
  }
}
