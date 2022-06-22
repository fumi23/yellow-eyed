import { connect } from 'net'

const PORT = 51013

export type Callback = (_response: string) => void

export default class YellowEyedRaw {
  private client: ReturnType<typeof connect>
  private callback = (_response: string) => {}

  constructor(host: string) {
    let buffer = ''
    this.client = connect(PORT, host)
    this.client.on('data', data => {
      // CRLF を受信するまでバッファリング
      buffer += data.toString()
      for (;;) {
        const pos = buffer.indexOf('\r\n')
        if (pos === -1) {
          break
        }
        const response = buffer.substring(0, pos)
        this.callback(response)
        buffer = buffer.substring(pos + 2)
      }
    })
  }

  onRecv(callback: Callback): void {
    this.callback = callback
  }

  send(command: string): void {
    this.client.write(`*${command}\r\n`)
  }

  close(): void {
    this.client.end()
  }
}
