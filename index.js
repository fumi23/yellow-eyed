import { Socket } from 'net'

const PORT = 51013
const DOCUMENT_PATH = 'https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf'

export default class YellowEyed {
  constructor(host) {
    this.host = host
  }
  // se -> se;ok;74.00;55.62;16.81
  // se -> se;err;010
  async getAllSensorValue() {
    const command = 'se'
    const response = await this.sendCommand([command])
    const values = this.parseResponse(response, command)
    return {
      illuminance: Number(values[0]),
      humidity: Number(values[1]),
      temperature: Number(values[2])
    }
  }
  sendCommand(segments) {
    return new Promise((resolve, reject) => {
      let buffer = ''
      const socket = new Socket()
      socket.on('data', data => {
        // \r\n を受信するまでバッファリング
        buffer += data.toString()
        const pos = buffer.indexOf('\r\n')
        if (pos === -1) return

        const response = buffer.substring(0, pos)
        resolve(response)

        // 後続データがあってもバッファフラッシュ＆ソケットクローズ
        buffer = ''
        socket.end()
      })
      socket.on('error', reject)
      // 都度接続確立する
      socket.connect(PORT, this.host, () => {
        socket.write('*')
        segments.forEach(segment => { socket.write(segment) })
        socket.write('\r\n')
      })
    })
  }
  parseResponse(response, requestCommand) {
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
