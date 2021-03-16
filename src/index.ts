import { Socket } from 'net'

const PORT = 51013
const DOCUMENT_PATH = 'https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf'

type IlluminanceValue = { illuminance: number }
type HumidityValue = { humidity: number }
type TemperatureValue = { temperature: number }
type AllSensorValue = IlluminanceValue & HumidityValue & TemperatureValue

export default class YellowEyed {
  private readonly host: string

  public constructor(host: string) {
    this.host = host
  }

  // se -> se;ok;74.00;55.62;16.81
  // se -> se;err;010
  public async getAllSensorValue(): Promise<AllSensorValue> {
    const command = 'se'
    const response = await this.sendCommand([command])
    const values = this.parseResponse(response, command)
    return {
      illuminance: Number(values[0]),
      humidity: Number(values[1]),
      temperature: Number(values[2])
    }
  }

  private sendCommand(segments: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer = ''
      const socket = new Socket()
      socket.on('data', data => {
        // \r\n を受信するまでバッファリング
        buffer += data.toString()
        const pos = buffer.indexOf('\r\n')
        if (pos === -1) return

        // 後続データがあってもバッファフラッシュ＆ソケットクローズ
        const response = buffer.substring(0, pos)
        buffer = ''
        socket.end()

        resolve(response)
      })
      socket.on('error', reject)
      // 都度接続確立する
      socket.connect(PORT, this.host, () => {
        socket.write('*')
        segments.forEach(segment => {
          socket.write(segment)
        })
        socket.write('\r\n')
      })
    })
  }

  private parseResponse(response: string, requestCommand: string): string[] {
    const [responseCommand, result, ...values] = response.split(';')
    if (responseCommand !== requestCommand) {
      throw new Error(`Command mismatched: ${response}`)
    }
    switch (result) {
      case 'ok':
        return values
      case 'err':
        throw new Error(`Error Code: ${values[0]}; See ${DOCUMENT_PATH}`)
      default:
        throw new Error(`Unknown result: ${response}`)
    }
  }
}
