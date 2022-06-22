import YellowEyedRaw, { Callback } from './yellow-eyed-raw'

const DOCUMENT_PATH = 'https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf'

type Illuminance = { illuminance: number }
type Humidity = { humidity: number }
type Temperature = { temperature: number }
type AllSensors = Illuminance & Humidity & Temperature

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

  private sendCommandNaive(command: string) {
    return new Promise(resolve => {
      this.registerCallback(command, resolve)
    })
  }

  private sendCommand(cmd: string, ...params: unknown[]): Promise<string[]> {
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

  async getIlluminanceValue(): Promise<Illuminance> {
    const values = await this.sendCommand('li')
    return { illuminance: Number(values[0]) }
  }

  async getHumidityValue(): Promise<Humidity> {
    const values = await this.sendCommand('hu')
    return { humidity: Number(values[0]) }
  }

  async getTemperatureValue(): Promise<Temperature> {
    const values = await this.sendCommand('te')
    return { temperature: Number(values[0]) }
  }

  async getAllSensorValue(): Promise<AllSensors> {
    const values = await this.sendCommand('se')
    return {
      illuminance: Number(values[0]),
      humidity: Number(values[1]),
      temperature: Number(values[2])
    }
  }
}
