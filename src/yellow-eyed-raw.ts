import { Socket } from 'net'

const PORT = 51013

export default class YellowEyedRaw {
  private host: string
  private socket: Socket
  private onConnect = () => {}
  private onError = (_error: Error) => {}
  private onData = (_data: Buffer) => {}
  private onClose = (_hadError: boolean) => {}

  constructor(host: string) {
    this.host = host
    this.socket = new Socket()
      .on('connect', () => this.onConnect())
      .on('error', (error: Error) => this.onError(error))
      .on('data', (data: Buffer) => this.onData(data))
      .on('close', (hadError: boolean) => this.onClose(hadError))
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onConnect = resolve // 接続が正常に確立したとき
      this.onError = reject // 接続できなかったとき
      this.socket.connect(PORT, this.host)
    })
  }

  recv(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.onData = resolve // データを受信したとき
      this.onError = reject // 通信中のエラーが発生したとき
    })
  }

  async *waitReceive(): AsyncGenerator<string> {
    let buffer = ''
    for (;;) {
      const data = await this.recv()
      buffer += data.toString()
      for (;;) {
        // CRLF を受信するまでバッファリング
        const pos = buffer.indexOf('\r\n')
        if (pos === -1) {
          break
        }
        const response = buffer.substring(0, pos)
        buffer = buffer.substring(pos + 2)
        yield response
      }
    }
  }

  send(command: string): void {
    this.socket.write(`*${command}\r\n`)
  }

  close(): Promise<boolean> {
    return new Promise(resolve => {
      this.onClose = resolve // fully closed になったとき
      this.socket.end()
    })
  }
}
