import { ref, toRaw, type Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { openDB, type IDBPDatabase } from 'idb'
import { DEFAULT_DATABASE_NAME } from '@/config/database'
import { capitalize } from '@/utils/stringUtils'
import { LogLevel, useLogger } from '@/composables/useLogger'
import { IndexedDBError } from '@/errors/IndexedDBError'
import type { Expense } from '@/components/ExpenseFormNew.vue'

const logger = useLogger()

// Error message constants for i18n integration
export enum INDEXEDDB_ERROR_TYPES {
  BROWSER_NOT_SUPPORTED = 'browserNotSupported',
  STORE_CREATION_FAILED = 'storeCreationFailed',
  DATABASE_NOT_INITIALIZED = 'databaseNotInitialized',
  ITEM_ADDITION_FAILED = 'itemAdditionFailed',
  ITEM_RETRIEVAL_FAILED = 'itemRetrievalFailed'
}

export const INDEXEDDB_ERROR_MESSAGES = {
  [INDEXEDDB_ERROR_TYPES.BROWSER_NOT_SUPPORTED]: 'errors.indexedDB.browserNotSupported',
  [INDEXEDDB_ERROR_TYPES.STORE_CREATION_FAILED]: 'errors.indexedDB.storeCreationFailed',
  [INDEXEDDB_ERROR_TYPES.DATABASE_NOT_INITIALIZED]: 'errors.indexedDB.databaseNotInitialized',
  [INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED]: 'errors.indexedDB.itemAdditionFailed',
  [INDEXEDDB_ERROR_TYPES.ITEM_RETRIEVAL_FAILED]: 'errors.indexedDB.itemRetrievalFailed'
}

export const INDEXEDDB_INFORMATION_MESSAGES = {
  OBJECT_STORE_CREATION: 'Creating a new object store...'
}

export type Item = Expense

interface UseIndexedDBResult {
  db: IDBPDatabase | null
  error: Ref<IndexedDBError | null>
  addItemsToStore: (storeName: string, itemOrItems: Item | Item[]) => Promise<Item[] | null>
  createStoreInDB: (storeName: string, indexes?: string[] | null) => Promise<undefined | null>
  getAllItemsFromStoreWithCursor: (
    storeName: string,
    limit?: number,
    startKey?: IDBValidKey
  ) => Promise<Item[] | null>
}

const STORE_KEYPATH = '_id'

export function useindexedDB(dbName = DEFAULT_DATABASE_NAME, version = 1): UseIndexedDBResult {
  const setError = (type: INDEXEDDB_ERROR_TYPES, err?: Error) => {
    error.value = new IndexedDBError(type, INDEXEDDB_ERROR_MESSAGES[type], JSON.stringify(err))
  }

  // The error ref
  const error = ref<IndexedDBError | null>(null)
  let db: IDBPDatabase | null = null
  let _version = version || 1

  // Check for browser support
  if (!('indexedDB' in window)) {
    setError(INDEXEDDB_ERROR_TYPES.BROWSER_NOT_SUPPORTED)

    return { db: null, error, addItemsToStore, createStoreInDB, getAllItemsFromStoreWithCursor }
  }

  async function ensureStoreExists(storeName: string) {
    if (!db) {
      logger.toConsole(
        INDEXEDDB_ERROR_MESSAGES[INDEXEDDB_ERROR_TYPES.DATABASE_NOT_INITIALIZED],
        LogLevel.WARN
      )
    }

    if (!db?.objectStoreNames?.contains(storeName)) {
      try {
        await createStoreInDB(storeName)
      } catch (err: any) {
        setError(INDEXEDDB_ERROR_TYPES.STORE_CREATION_FAILED, err)
        return null // Indicate error by returning null
      }
    }
  }

  async function createStoreInDB(storeName: string, indexes?: string[] | null) {
    try {
      db = await openDB(dbName, _version++, {
        upgrade(db) {
          // Checks if the object store exists:
          if (!db.objectStoreNames.contains(storeName)) {
            logger.toConsole(INDEXEDDB_INFORMATION_MESSAGES.OBJECT_STORE_CREATION, LogLevel.INFO)

            // If the object store does not exist, create it:
            const newStore = db.createObjectStore(storeName, { keyPath: STORE_KEYPATH })

            if (indexes) {
              indexes.forEach((index) => {
                newStore.createIndex('by' + capitalize(index), index, { unique: false })
              })
            }
          }
        }
      })
    } catch (err: any) {
      setError(INDEXEDDB_ERROR_TYPES.STORE_CREATION_FAILED, err)
      return null // Indicate error by returning null
    }
  }

  async function addItemsToStore(storeName: string, itemOrItems: Item | Item[]) {
    await ensureStoreExists(storeName)
    if (!db) return null

    // Ensure itemOrItems is an array:
    const itemsArray = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]
    if (itemsArray.length <= 0) {
      setError(
        INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED,
        new Error(`There is no item to add to database: ${itemsArray}`)
      )
      return null // Indicate error by returning null
    }

    // Ensure that items to save to database :
    // 1. are raw JS and not Vue 3 reactive objects
    // 2. include "_id", defined as keyPath so required
    const itemsToCreate = itemsArray
      .filter((item) => !!item && Object.keys(item).length > 0)
      .map((item) => ({
        ...toRaw(item),
        [STORE_KEYPATH]: uuidv4(),
        _createdAt: new Date()
      }))

    // Create a transaction on the store in read/write mode:
    const tx = db.transaction(storeName, 'readwrite')

    try {
      // Add multiple items to the store in a single transaction:
      await Promise.all(itemsToCreate.map((item) => tx.store.add(item)))
      await tx.done
      return itemsToCreate // Return added items on success
    } catch (err: any) {
      setError(INDEXEDDB_ERROR_TYPES.ITEM_ADDITION_FAILED, err)
      return null // Indicate error by returning null
    }
  }

  async function getAllItemsFromStoreWithCursor(
    storeName: string,
    limit = 500,
    startKey?: IDBValidKey
  ) {
    await ensureStoreExists(storeName)
    if (!db) return null

    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const items: Item[] = []

    try {
      // Open a cursor on the designated object store
      let cursor = await store.openCursor(startKey)

      // Iterate on the cursor, row by row, respecting the limit
      let count = 0
      while (cursor && count < limit) {
        items.push(cursor.value)
        cursor = await cursor.continue()
        count++
      }

      await tx.done
    } catch (err: any) {
      setError(INDEXEDDB_ERROR_TYPES.ITEM_RETRIEVAL_FAILED, err)
      return null // Indicate error by returning null
    }

    return items
  }

  return {
    db,
    error,
    addItemsToStore,
    createStoreInDB,
    getAllItemsFromStoreWithCursor
  }
}
