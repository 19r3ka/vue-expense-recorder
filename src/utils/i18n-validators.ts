import * as validators from '@vuelidate/validators'
import { i18n } from '@/plugins/i18n'

const messagePath = ({ $validator }: { $validator: string }) =>
  `expenseForm.validations.${$validator}`

const isValidDate = (value: string | number | Date) => {
  if (!value) return true // if the value is empty, it's "valid"
  const date = new Date(value)
  return !isNaN(date.getTime()) // check if the date is valid
}

// custom validators
const nowOrPast = (value: Date) => isValidDate(value) && new Date(value) <= new Date()
const isLength = (length: number) =>
  validators.helpers.withParams(
    { length },
    (value: any) => validators.helpers.len(value) === length
  )

// create the i18n message instance for use by vue-i18n@9
const withI18nMessage = validators.createI18nMessage({ t: i18n.global.t.bind(i18n), messagePath })

// custom validators wrapped in i18n messaging
const alpha = withI18nMessage(validators.alpha)
const required = withI18nMessage(validators.required)
const req = withI18nMessage(validators.helpers.req as validators.ValidatorWrapper, {
  withArguments: true
})
const maxLength = withI18nMessage(validators.maxLength, { withArguments: true })
const between = withI18nMessage(validators.between, { withArguments: true })
const minValue = withI18nMessage(validators.minValue, { withArguments: true })
const numeric = withI18nMessage(validators.numeric)
const length = withI18nMessage(isLength, {
  withArguments: true
})
const notInFuture = withI18nMessage(nowOrPast)

export {
  alpha,
  required,
  length,
  maxLength,
  minValue,
  between,
  numeric,
  req,
  isValidDate,
  notInFuture
}
