import { selector, SetRecoilState } from 'recoil'
import {
  atEveryOptions,
  defaultMinuteOptionsWithOrdinal,
  defaultWeekOptions,
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  DEFAULT_MONTH_OPTS,
  DEFAULT_WEEK_OPTS,
  LAST_DAY_OF_MONTH_OPT,
  onEveryOptions,
  periodOptions,
} from './constants'
import {
  cronValidationErrorMessageState,
  dayOfMonthAtEveryState,
  dayOfMonthRangeEndSchedulerState,
  dayOfMonthRangeStartSchedulerState,
  dayOfMonthState,
  hourAtEveryState,
  hourRangeEndSchedulerState,
  hourRangeStartSchedulerState,
  hourState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
  monthState,
  periodState,
  weekState,
} from './store'
import {
  getMinutesIndex,
  getPeriodIndex,
  getTimeIndex,
  getTimesOfTheDay,
  isIncreasingSequence,
  validateCronExp,
} from './utils'

export const minuteCronState = selector<string>({
  key: 'minuteCronState',
  get: ({ get }) => {
    const minutes = get(minuteState)
    if (
      minutes.map((minute) => minute.value).join('') ===
      DEFAULT_MINUTE_OPTS.map((minute) => minute.value).join('')
    ) {
      return '*'
    } else if (get(minuteAtEveryState).value === 'every') {
      const startIndex = getMinutesIndex(get(minuteRangeStartSchedulerState))
      const endIndex = getMinutesIndex(get(minuteRangeEndSchedulerState))
      if (endIndex - startIndex === 59) {
        return `*/${minutes.map((minute) => minute.value).join('')}`
      }
      return `${startIndex}-${endIndex}/${minutes
        .map((minute) => minute.value)
        .join('')}`
    } else if (isIncreasingSequence(minutes) && minutes.length !== 1) {
      return `${minutes[0].value}-${minutes[minutes.length - 1].value}`
    } else {
      return minutes.map((minute) => minute.value).join(',')
    }
  },
})

export const hourCronState = selector<string>({
  key: 'hourCronState',
  get: ({ get }) => {
    const hours = get(hourState)
    if (
      getPeriodIndex(get(periodState)) < 1 ||
      hours.map((hour) => hour.value).join('') ===
        DEFAULT_HOUR_OPTS_EVERY.map((hour) => hour.value).join('')
    ) {
      return '*'
    } else if (get(hourAtEveryState).value === 'every') {
      const startIndex = getTimeIndex(get(hourRangeStartSchedulerState))
      const endIndex = getTimeIndex(get(hourRangeEndSchedulerState))
      if (endIndex - startIndex === 23) {
        return `*/${hours.map((hour) => hour.value).join('')}`
      }
      return `${startIndex}-${endIndex}/${hours
        .map((hour) => hour.value)
        .join('')}`
    } else if (isIncreasingSequence(hours) && hours.length !== 1) {
      return `${hours[0].value}-${hours[hours.length - 1].value}`
    } else {
      return hours.map((hour) => hour.value).join(',')
    }
  },
})

export const dayOfMonthCronState = selector<string>({
  key: 'dayOfMonthCronState',
  get: ({ get }) => {
    const dayOfMonth = get(dayOfMonthState)
    if (
      getPeriodIndex(get(periodState)) < 3 ||
      dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join('') ===
        DEFAULT_DAY_OF_MONTH_OPTS.map((day) => day.value).join('')
    ) {
      return '*'
    } else if (get(dayOfMonthAtEveryState).value === 'every') {
      const startIndex = get(dayOfMonthRangeStartSchedulerState).value
      const endIndex = get(dayOfMonthRangeEndSchedulerState).value
      if (Number(endIndex) - Number(startIndex) === 30) {
        return `*/${dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join('')}`
      }
      return `${startIndex}-${endIndex}/${dayOfMonth
        .map((dayOfMonth) => dayOfMonth.value)
        .join('')}`
    } else if (dayOfMonth[0].value === 'L') {
      return 'L'
    } else if (isIncreasingSequence(dayOfMonth) && dayOfMonth.length !== 1) {
      return `${dayOfMonth[0].value}-${dayOfMonth[dayOfMonth.length - 1].value}`
    } else {
      return dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join(',')
    }
  },
})

export const monthCronState = selector<string>({
  key: 'monthCronState',
  get: ({ get }) => {
    const months = get(monthState)
    if (
      getPeriodIndex(get(periodState)) < 4 ||
      get(monthState)
        .map((month) => month.value)
        .join('') === DEFAULT_MONTH_OPTS.map((month) => month.value).join('')
    ) {
      return '*'
    } else if (isIncreasingSequence(months) && months.length !== 1) {
      return `${months[0].value}-${months[months.length - 1].value}`
    } else {
      return months.map((month) => month.value).join(',')
    }
  },
})

export const dayOfWeekCronState = selector<string>({
  key: 'dayOfWeekCronState',
  get: ({ get }) => {
    const weeks = get(weekState)
    if (getPeriodIndex(get(periodState)) < 2) {
      return '*'
    } else if (
      get(weekState)
        .map((dayOfWeek) => dayOfWeek.value)
        .join('') === DEFAULT_WEEK_OPTS.map((week) => week.value).join('')
    ) {
      return '*'
    } else if (isIncreasingSequence(weeks) && weeks.length !== 1) {
      return `${weeks[0].value}-${weeks[weeks.length - 1].value}`
    } else if (weeks.length === 1) {
      return weeks[0].value
    } else {
      return weeks.map((week) => week.value).join(',')
    }
  },
})

export const cronExpState = selector<string>({
  key: 'cronExpState',
  get: ({ get }) =>
    `${get(minuteCronState)} ${get(hourCronState)} ${get(
      dayOfMonthCronState
    )} ${get(monthCronState)} ${get(dayOfWeekCronState)}`,
  set: ({ get, set }, newValue) => {
    const res = validateCronExp(newValue.toString())
    set(cronValidationErrorMessageState, res.hasError ? res.message : '')
    if (!res.hasError) {
      const cronParts = newValue.toString().split(' ')
      generateMinute(cronParts[0], set)
      generateHour(cronParts[1], set)
      generateDayOfMonth(cronParts[2], set)
      generateMonth(cronParts[3], set)
      generateWeek(cronParts[4], set)
      const period = get(periodState)
      if (cronParts[3] !== '*' && getPeriodIndex(period) < 4) {
        set(periodState, periodOptions[4])
      } else if (cronParts[2] !== '*' && getPeriodIndex(period) < 3) {
        set(periodState, periodOptions[3])
      } else if (cronParts[4] !== '*' && getPeriodIndex(period) < 2) {
        set(periodState, periodOptions[2])
      } else if (cronParts[1] !== '*' && getPeriodIndex(period) < 1) {
        set(periodState, periodOptions[1])
      }
    }
  },
})

const generateMinute = (part: string, set: SetRecoilState) => {
  if (part.indexOf('/') > 0) {
    let subparts = part.split('/')
    set(minuteAtEveryState, atEveryOptions[1])
    if (subparts[0].indexOf('-') > 0) {
      let subsubparts = subparts[0].split('-')
      set(
        minuteRangeStartSchedulerState,
        defaultMinuteOptionsWithOrdinal()[Number(subsubparts[0])]
      )
      set(
        minuteRangeEndSchedulerState,
        defaultMinuteOptionsWithOrdinal()[Number(subsubparts[1])]
      )
    } else if (subparts[0] === '*') {
      set(minuteRangeStartSchedulerState, defaultMinuteOptionsWithOrdinal()[0])
      set(minuteRangeEndSchedulerState, defaultMinuteOptionsWithOrdinal()[59])
    }
    set(minuteState, [DEFAULT_MINUTE_OPTS[Number(subparts[1])]])
  } else if (part.indexOf('-') > 0) {
    let subparts = part.split('-')
    set(
      minuteState,
      DEFAULT_MINUTE_OPTS.filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1])
      })
    )
  } else if (part !== '*') {
    set(minuteAtEveryState, atEveryOptions[0])
    set(
      minuteState,
      DEFAULT_MINUTE_OPTS.filter((_, idx) => {
        return part.split(',').includes(idx.toString())
      })
    )
  } else if (part === '*') {
    set(minuteAtEveryState, atEveryOptions[0])
    set(minuteState, DEFAULT_MINUTE_OPTS)
  }
}

const generateHour = (part: string, set: SetRecoilState) => {
  if (part.indexOf('/') > 0) {
    let subparts = part.split('/')
    set(hourAtEveryState, atEveryOptions[1])
    if (subparts[0].indexOf('-') > 0) {
      let subsubparts = subparts[0].split('-')
      set(
        hourRangeStartSchedulerState,
        getTimesOfTheDay()[Number(subsubparts[0])]
      )
      set(
        hourRangeEndSchedulerState,
        getTimesOfTheDay()[Number(subsubparts[1])]
      )
    } else if (subparts[0] === '*') {
      set(hourRangeStartSchedulerState, getTimesOfTheDay()[0])
      set(hourRangeEndSchedulerState, getTimesOfTheDay()[23])
    }
    set(hourState, [DEFAULT_HOUR_OPTS_EVERY[Number(subparts[1])]])
  } else if (part.indexOf('-') > 0) {
    let subparts = part.split('-')
    set(
      hourState,
      DEFAULT_HOUR_OPTS_EVERY.filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1])
      })
    )
  } else if (part !== '*') {
    set(hourAtEveryState, atEveryOptions[0])
    set(
      hourState,
      DEFAULT_HOUR_OPTS_EVERY.filter((_, idx) => {
        return part.split(',').includes(idx.toString())
      })
    )
  } else if (part === '*') {
    set(hourAtEveryState, atEveryOptions[0])
    set(hourState, DEFAULT_HOUR_OPTS_EVERY)
  }
}

const generateDayOfMonth = (part: string, set: SetRecoilState) => {
  if (part.indexOf('/') > 0) {
    let subparts = part.split('/')
    set(dayOfMonthAtEveryState, onEveryOptions[1])
    if (subparts[0].indexOf('-') > 0) {
      let subsubparts = subparts[0].split('-')
      set(
        dayOfMonthRangeStartSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[0]) - 1]
      )
      set(
        dayOfMonthRangeEndSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[1]) - 1]
      )
    } else if (subparts[0] === '*') {
      set(
        dayOfMonthRangeStartSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]
      )
      set(
        dayOfMonthRangeEndSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]
      )
    }
    set(dayOfMonthState, [DEFAULT_DAY_OF_MONTH_OPTS[Number(subparts[1]) - 1]])
  } else if (part === 'L') {
    set(dayOfMonthAtEveryState, onEveryOptions[0])
    set(dayOfMonthState, [LAST_DAY_OF_MONTH_OPT])
  } else if (part.indexOf('-') > 0) {
    let subparts = part.split('-')
    set(
      dayOfMonthState,
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter((_, idx) => {
        return idx + 1 >= Number(subparts[0]) && idx + 1 <= Number(subparts[1])
      })
    )
  } else if (part !== '*') {
    set(dayOfMonthAtEveryState, onEveryOptions[0])
    set(
      dayOfMonthState,
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter((_, idx) => {
        return part.split(',').includes((idx + 1).toString())
      })
    )
  } else if (part === '*') {
    set(dayOfMonthAtEveryState, onEveryOptions[0])
    set(dayOfMonthState, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD)
  }
}

const generateMonth = (part: string, set: SetRecoilState) => {
  if (part.indexOf('-') > 0) {
    let subparts = part.split('-')
    set(
      monthState,
      DEFAULT_MONTH_OPTS.filter((_, idx) => {
        return idx + 1 >= Number(subparts[0]) && idx + 1 <= Number(subparts[1])
      })
    )
  } else if (part !== '*') {
    set(
      monthState,
      DEFAULT_MONTH_OPTS.filter((_, idx) => {
        return part.split(',').includes((idx + 1).toString())
      })
    )
  } else {
    set(monthState, DEFAULT_MONTH_OPTS)
  }
}

const generateWeek = (part: string, set: SetRecoilState) => {
  if (part.indexOf('-') > 0) {
    let subparts = part.split('-')
    set(
      weekState,
      DEFAULT_WEEK_OPTS.filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1])
      })
    )
  } else if (part !== '*') {
    set(
      weekState,
      DEFAULT_WEEK_OPTS.filter((_, idx) => {
        return part.split(',').includes(idx.toString())
      })
    )
  } else {
    set(weekState, defaultWeekOptions)
  }
}