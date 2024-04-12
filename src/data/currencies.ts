import currencyData from '@/data/currencies.json'

export interface Currency {
  currencyName: string
  currencyCountries: string[]
}

export interface CurrencyData {
  [code: string]: Currency
}

const getCurrencyData = async () => await import('@/data/currencies.json')

const currencyCodes = Object.keys(currencyData).sort()

const defaultCurrencyCode = 'XOF' // long live Togo !!!

export default { defaultCurrencyCode, currencyCodes, getCurrencyData }
export { defaultCurrencyCode, currencyCodes, getCurrencyData }
