import { reactive, ref, toRaw } from 'vue'
import { openDB, type IDBPDatabase } from 'idb'
import { DEFAULT_DATABASE_NAME } from '@/config/database'
import { capitalize } from '@/utils/stringUtils'
import { v4 as uuidv4 } from 'uuid'

const STORE_KEYPATH = '_id'

export function useindexedDB(dbName = DEFAULT_DATABASE_NAME, version = 1) {
  const error = ref('')
  let db: IDBPDatabase | null = null

  // check if user-agent supports IndexedDB first
  if (!('indexedDB' in window)) {
    error.value = 'Your browser does not support IndexDB'
    console.error(error.value)
    return
  }

  async function ensureStoreExists(storeName: string) {
    if (!db?.objectStoreNames.contains(storeName)) {
      try {
        await createStoreInDB(storeName)
      } catch (err: any) {
        error.value = err.message || 'An error occurred while creating the store in the database!'
        console.error(error.value)
        throw err
      }
    }

    if (!db) {
      throw new Error('Database not initialized')
    }
  }

  async function createStoreInDB(storeName: string, indexes?: string[]) {
    db = await openDB(dbName, version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          // Checks if the object store exists:
          console.log('Creating a new object store...')

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
    return db
  }

  async function addItemsToStore(storeName: string, itemOrItems: any | any[]) {
    if (!db?.objectStoreNames.contains(storeName)) {
      try {
        await createStoreInDB(storeName)
      } catch (err: any) {
        error.value = err.message || 'An error occurred while creating the store in the database!'
        console.error(error.value)
        throw err
      }
    }

    if (!db) return

    // Create a transaction on the store in read/write mode:
    const tx = db.transaction(storeName, 'readwrite')

    // Ensure itemOrItems is an array:
    const itemsArray = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]

    // Ensure that items to save to database :
    // 1. are raw JS and not Vue 3 reactive objects
    // 2. include "_id", defined as keyPath so required
    const itemsToCreate = itemsArray.map((item) => ({
      ...toRaw(item),
      [STORE_KEYPATH]: uuidv4(),
      _createdAt: new Date()
    }))

    // Add multiple items to the store in a single transaction:
    const res = await Promise.all(itemsToCreate.map((item) => tx.store.add(item)))
    await tx.done

    return res
  }

  async function getItemsFromStoreWithCursor(
    storeName: string,
    limit = 10, // Default limit for pagination
    startKey?: IDBValidKey // Optional starting key for pagination
  ): Promise<any[]> {
    await ensureStoreExists(storeName)

    if (!db) return []

    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const items: any[] = reactive([])

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

    return items
  }

  async function getAllItemsFromStoreWithCursor(storeName: string, limit = 100): Promise<any[]> {
    let allItems = []

    try {
      allItems = await getItemsFromStoreWithCursor(storeName, limit)
    } catch (err: any) {
      error.value = err.message || 'An error occurred while retrieving items from the database!'
      console.error(error.value)
      throw err
    }

    return allItems
  }

  return {
    db,
    addItemsToStore,
    createStoreInDB,
    getAllItemsFromStoreWithCursor
  }
}
