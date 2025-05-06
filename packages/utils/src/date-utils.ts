import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date, formatString = "yyyy年MM月dd日"): string {
  return format(date, formatString, { locale: zhCN })
}

/**
 * Get the start and end dates of a week containing the given date
 */
export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Start week on Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }) // End week on Sunday

  return {
    start,
    end,
    formatted: `${formatDate(start)} - ${formatDate(end, "MM月dd日")}`,
  }
}

/**
 * Get an array of dates for a week containing the given date
 */
export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })

  return Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(start, i)
    return {
      date: day,
      dayName: format(day, "EEEE", { locale: zhCN }),
      shortDayName: format(day, "EEE", { locale: zhCN }),
      formatted: formatDate(day),
    }
  })
}
