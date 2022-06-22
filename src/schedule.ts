type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
type Schedule = { schedule: DayOfWeek[] | number }

const Schedule = {
  parse(code: string): DayOfWeek[] | number {
    if (code.startsWith('w')) {
      return ['Sun'] // TODO: WIP
    } else {
      return Number(code)
    }
  },
  stringify(schedule: DayOfWeek[] | number): string {
    if (typeof schedule !== 'number') {
      return 'w80' // TODO: WIP
    } else {
      return schedule.toString()
    }
  }
}

export default Schedule
