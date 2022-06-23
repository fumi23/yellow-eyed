import { strict as assert } from 'assert'

import Result from './result'
import Schedule from './schedule'
import Time from './time'
import { chop } from './util/array'
import YellowEyedRaw, { Callback } from './yellow-eyed-raw'

const DOCUMENT_PATH = 'https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf'

type Command =
  | 'au'
  | 'vr'
  | 'li'
  | 'hu'
  | 'te'
  | 'se'
  | 'is'
  | 'ic'
  | 'cc'
  | 'tg'
  | 'ts'
  | 'tm'
  | 'tl'
  | 'td'
type Version = { version: string }
type Illuminance = { illuminance: number }
type Humidity = { humidity: number }
type Temperature = { temperature: number }
type AllSensors = Illuminance & Humidity & Temperature
type Signal = { signalId: string }
type Timer = Signal & Time & Schedule
type TimerId = { timerId: string }
type TimerEntry = TimerId & Timer
type Response<T> = Promise<Result<T>>

export default class YellowEyed {
  private client: YellowEyedRaw
  private callbackStack: Callback[] = []

  constructor(host: string) {
    this.client = new YellowEyedRaw(host)
    this.client.onRecv(response => {
      const callback = this.callbackStack.pop()
      if (callback) {
        callback(response)
      }
    })
  }

  close(): void {
    this.client.close()
  }

  private registerCallback(command: string, callback: Callback) {
    this.callbackStack.push(callback)
    this.client.send(command)
  }

  private sendCommandNaive(cmd: Command): Response<string> {
    const command = cmd

    return new Promise(resolve => {
      this.registerCallback(command, response => {
        resolve({
          result: 'ok',
          value: response
        })
      })
    })
  }

  private sendCommand(cmd: Command, ...params: unknown[]): Response<string[]> {
    const command = [cmd, ...params].join(';')

    return new Promise((resolve, reject) => {
      this.registerCallback(command, response => {
        const [tag, result, ...values] = response.split(';')
        if (tag !== cmd) {
          reject(new Error(`Command mismatched: ${response}`))
        }
        switch (result) {
          case 'ok':
            resolve({
              result: 'ok',
              value: values
            })
            break
          case 'err':
            resolve({
              result: 'error',
              code: values[0],
              description: `See ${DOCUMENT_PATH}`
            })
            break
          default:
            reject(new Error(`Unknown result: ${response}`))
            break
        }
      })
    })
  }

  async healthCheck(): Response<void> {
    const result = await this.sendCommandNaive('au')
    return Result.map(result, response => {
      assert.equal(response, 'ok')
    })
  }

  async version(): Response<Version> {
    const result = await this.sendCommandNaive('vr')
    return Result.map(result, response => ({ version: response }))
  }

  async illuminance(): Response<Illuminance> {
    const result = await this.sendCommand('li')
    return Result.map(result, values => ({ illuminance: Number(values[0]) }))
  }

  async humidity(): Response<Humidity> {
    const result = await this.sendCommand('hu')
    return Result.map(result, values => ({ humidity: Number(values[0]) }))
  }

  async temperature(): Response<Temperature> {
    const result = await this.sendCommand('te')
    return Result.map(result, values => ({ temperature: Number(values[0]) }))
  }

  async allSensors(): Response<AllSensors> {
    const result = await this.sendCommand('se')
    return Result.map(result, values => ({
      illuminance: Number(values[0]),
      humidity: Number(values[1]),
      temperature: Number(values[2])
    }))
  }

  async emitSignal({ signalId }: Signal): Response<void> {
    const result = await this.sendCommand('is', signalId)
    return Result.map(result, _ => {})
  }

  async inputSignal({ signalId }: Signal): Response<void> {
    const result = await this.sendCommand('ic', signalId)
    return Result.map(result, _ => {})
  }

  async cancelInputSignal(): Response<void> {
    const result = await this.sendCommand('cc')
    return Result.map(result, _ => {})
  }

  async clock(): Response<Time> {
    const result = await this.sendCommand('tg')
    return Result.map(result, values => ({ time: Time.parse(values[0]) }))
  }

  async setClock({ time }: Time): Response<void> {
    const timestamp = Time.stringify(time)
    const result = await this.sendCommand('ts', timestamp)
    return Result.map(result, _ => {})
  }

  async inputTimer({ signalId, time, schedule = 0 }: Timer): Response<void> {
    const timestamp = Time.stringify(time)
    const code = Schedule.stringify(schedule)
    const result = await this.sendCommand('tm', signalId, timestamp, code)
    return Result.map(result, _ => {})
  }

  async listTimers(): Response<TimerEntry[]> {
    const result = await this.sendCommand('tl')
    return Result.map(result, ([length, ...flattedValues]) => {
      const timers = chop(flattedValues, 4).map(values => ({
        timerId: values[0],
        signalId: values[1],
        time: Time.parse(values[2]),
        schedule: Schedule.parse(values[3])
      }))
      assert.equal(timers.length, Number(length))
      return timers
    })
  }

  async deleteTimer({ timerId }: TimerId): Response<void> {
    const result = await this.sendCommand('td', timerId)
    return Result.map(result, _ => {})
  }
}
