import { strict as assert } from 'assert'

import Time from './time'
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
type Version = { version: string }
type Illuminance = { illuminance: number }
type Humidity = { humidity: number }
type Temperature = { temperature: number }
type AllSensors = Illuminance & Humidity & Temperature
type Signal = { signalId: string }

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

  private sendCommandNaive(cmd: Command): Promise<string> {
    const command = cmd

    return new Promise(resolve => {
      this.registerCallback(command, resolve)
    })
  }

  private sendCommand(cmd: Command, ...params: unknown[]): Promise<string[]> {
    const command = [cmd, ...params].join(';')

    return new Promise((resolve, reject) => {
      this.registerCallback(command, response => {
        const [tag, result, ...values] = response.split(';')
        if (tag !== cmd) {
          reject(new Error(`Command mismatched: ${response}`))
        }
        switch (result) {
          case 'ok':
            resolve(values)
            break
          case 'err':
            reject(new Error(`Error Code: ${values[0]}; See ${DOCUMENT_PATH}`))
            break
          default:
            reject(new Error(`Unknown result: ${response}`))
            break
        }
      })
    })
  }

  async healthCheck(): Promise<void> {
    const response = await this.sendCommandNaive('au')
    assert.equal(response, 'ok')
  }

  async version(): Promise<Version> {
    const response = await this.sendCommandNaive('vr')
    return { version: response }
  }

  async illuminance(): Promise<Illuminance> {
    const values = await this.sendCommand('li')
    return { illuminance: Number(values[0]) }
  }

  async humidity(): Promise<Humidity> {
    const values = await this.sendCommand('hu')
    return { humidity: Number(values[0]) }
  }

  async temperature(): Promise<Temperature> {
    const values = await this.sendCommand('te')
    return { temperature: Number(values[0]) }
  }

  async allSensors(): Promise<AllSensors> {
    const values = await this.sendCommand('se')
    return {
      illuminance: Number(values[0]),
      humidity: Number(values[1]),
      temperature: Number(values[2])
    }
  }

  async emitSignal({ signalId }: Signal): Promise<void> {
    const values = await this.sendCommand('is', signalId)
    assert.equal(values.length, 0)
  }

  async inputSignal({ signalId }: Signal): Promise<void> {
    const values = await this.sendCommand('ic', signalId)
    assert.equal(values.length, 0)
  }

  async cancelInputSignal(): Promise<void> {
    const values = await this.sendCommand('cc')
    assert.equal(values.length, 0)
  }

  async clock(): Promise<Time> {
    const values = await this.sendCommand('tg')
    return { time: Time.parse(values[0]) }
  }

  async setClock({ time }: Time): Promise<void> {
    const timestamp = Time.stringify(time)
    const values = await this.sendCommand('ts', timestamp)
    assert.equal(values.length, 0)
  }
}
