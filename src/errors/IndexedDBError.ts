import { INDEXEDDB_ERROR_MESSAGES, type INDEXEDDB_ERROR_TYPES } from '@/composables/useIndexedDB'
import { BaseError } from './BaseError'

export class IndexedDBError extends BaseError {
  constructor(type: INDEXEDDB_ERROR_TYPES, message?: string, context?: string) {
    super(type, message || INDEXEDDB_ERROR_MESSAGES[type], 'IndexedDBError', context)
  }
}
