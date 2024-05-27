import { ref, computed } from 'vue'
import { format, formatDistance, formatRelative, isToday, isYesterday, startOfDay } from 'date-fns'
import { useI18n } from 'vue-i18n'
import { enUS, fr } from 'date-fns/locale'
import type { Locale } from 'date-fns'

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export function useDateTime() {
  const { locale } = useI18n()
  const now = ref(new Date())

  // Helper function to get the date-fns locale object based on the current i18n locale
  const getDateFnsLocale = (i18nLocale: string): Locale => {
    switch (i18nLocale) {
      case 'en-US':
        return enUS
      case 'fr':
        return fr
      default:
        return enUS // Fallback to English if the locale is not supported
    }
  }

  // Computed property to get the current date-fns locale object
  const dateFnsLocale = computed(() => getDateFnsLocale(locale.value))

  // Function to format date in a human-friendly way
  const formatDate = (date: Date): string => {
    if (isToday(date) || isYesterday(date)) {
      let formattedDate = formatRelative(date, now.value, { locale: dateFnsLocale.value })
      // Remove the time part from the formatted string
      formattedDate = formattedDate.replace(/ at .*/, '')
      return formattedDate
    } else {
      return format(date, 'EEE, MMM d', { locale: dateFnsLocale.value })
    }
  }

  // Function to format time in a human-friendly way
  const formatTime = (date: Date): string => {
    const diffInSeconds = (now.value.getTime() - date.getTime()) / 1000
    const threshold = 86400

    return diffInSeconds < threshold
      ? formatDistance(date, now.value, { addSuffix: true, locale: dateFnsLocale.value })
      : format(date, 'HH:mm', { locale: dateFnsLocale.value })
  }

  function groupItemsByDate<T extends { datetime: Date }>(items: T[]): Record<string, T[]> {
    return items.reduce(
      (groups, item) => {
        const dateKey = format(startOfDay(item.datetime), 'yyyy/MM/dd')
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(item)
        return groups
      },
      {} as Record<string, T[]>
    )
  }

  function sortItemsByTime<T extends { datetime: Date }>(
    items: T[],
    order: SortDirection = SortDirection.ASC
  ): T[] {
    const sortFn = (a: T, b: T) => {
      const timeA = a.datetime.getTime()
      const timeB = b.datetime.getTime()
      return order === SortDirection.ASC ? timeA - timeB : timeB - timeA
    }
    return [...items].sort(sortFn)
  }

  return {
    formatDate,
    formatTime,
    groupItemsByDate,
    sortItemsByTime
  }
}
