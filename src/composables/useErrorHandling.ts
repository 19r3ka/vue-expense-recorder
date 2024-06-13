import { reactive } from 'vue'

type NullableError = Error | null

interface ErrorRecord {
  apiError: NullableError
  dbError: NullableError
  // TODO: add more error types as needed
}

const errorsFactory = (): ErrorRecord => ({
  apiError: null,
  dbError: null
  // TODO: update the properties according to ErrorRecord changes
})

export function useErrorHandler() {
  const error = reactive<ErrorRecord>(errorsFactory())

  const handleApiError = (err: Error) => {
    error.apiError = err
  }
  const handleDbError = (err: Error) => {
    error.dbError = err
  }

  return { error, handleApiError, handleDbError }
}
