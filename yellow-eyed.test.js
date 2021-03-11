const { createServer } = require('net')

function createMockServer(response) {
  return createServer(conn => {
    let buffer = ''
    conn.on('data', data => {
      buffer += data.toString()
      const pos = buffer.indexOf('\r\n')
      if (pos === -1) return

        buffer = ''
        conn.write(response + '\r\n')
    })
  }).listen(51013)
}


const YellowEyed = require('yellow-eyed')

const client = new YellowEyed('127.0.0.1')

test('reeceive ok response', async () => {
  const server = createMockServer('se;ok;74.00;41.08;17.17')

  const promise = client.getAllSensorValue()
  await expect(promise).resolves.toEqual({
    illuminance: 74,
    humidity: 41.08,
    temperature: 17.17
  })
  server.close()
})

test('reeceive error response', async () => {
  const server = createMockServer('se;err;001')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Error Code: 001')
  server.close()
})

test('reeceive unknown response', async () => {
  const server = createMockServer('se;yyy')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Unknown result')
  server.close()
})

test('reeceive mismatched response', async () => {
  const server = createMockServer('xx:ok')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Command mismatched')
  server.close()
})
