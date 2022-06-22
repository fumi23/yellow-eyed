type Time = { time: Date }

const Time = {
  parse(timestamp: string): Date {
    return new Date(Number(timestamp) * 1000)
  },
  stringify(time: Date): string {
    return (time.getTime() / 1000).toFixed()
  }
}

export default Time
