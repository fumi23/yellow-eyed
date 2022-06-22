const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
type DayOfWeek = typeof dayOfWeek[number]
type Schedule = { schedule: DayOfWeek[] | number }

const Schedule = {
  parse(code: string): DayOfWeek[] | number {
    if (code.startsWith('w')) {
      const hexCode = code.substring(1)
      const flags = parseInt(hexCode, 16)
      return dayOfWeek.filter((_day, i) => {
        const mask = 1 << (7 - i)
        return Boolean(flags & mask)
      })
    } else {
      return Number(code)
    }
  },
  stringify(schedule: DayOfWeek[] | number): string {
    if (typeof schedule !== 'number') {
      const flags = dayOfWeek.reduce((flags, day, i) => {
        const mask = schedule.includes(day) ? 1 << (7 - i) : 0
        return flags | mask
      }, 0)
      const hexCode = flags.toString(16).padStart(2, '0')
      return 'w' + hexCode
    } else {
      return schedule.toString()
    }
  }
}

export default Schedule
