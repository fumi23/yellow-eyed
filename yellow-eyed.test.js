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

/*
beforeEach(() => {
  const server = createMockServer(message)
})
afterEach(() => {
  server.close()
})
*/

const YellowEyed = require('yellow-eyed')

const client = new YellowEyed('127.0.0.1')

test('receive ok response', async () => {
  jest.spyOn(client, 'sendCommand').mockReturnValue(Promise.resolve('se;ok;74.00;41.08;17.17'))

  const promise = client.getAllSensorValue()
  await expect(promise).resolves.toEqual({
    illuminance: 74,
    humidity: 41.08,
    temperature: 17.17
  })
})

test('receive error response', async () => {
  const server = createMockServer('se;err;001')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Error Code: 001')
  server.close()
})

test('receive unknown response', async () => {
  const server = createMockServer('se;yyy')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Unknown result')
  server.close()
})

test('receive mismatched response', async () => {
  const server = createMockServer('xx:ok')

  const promise = client.getAllSensorValue()
  await expect(promise).rejects.toThrow('Command mismatched')
  server.close()
})
