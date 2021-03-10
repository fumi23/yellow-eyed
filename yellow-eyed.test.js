const response = jest.fn()
const { createServer } = require('net')
createServer(conn => {
  let buffer = ''
  conn.on('data', data => {
    buffer += data.toString()
    const pos = buffer.indexOf('\r\n')
    if (pos === -1) return

    buffer = ''
    conn.write(response())
  })
}).listen(51013)


const YellowEyed = require('yellow-eyed')

const client = new YellowEyed('127.0.0.1')

test('reeceive ok response', () => {
  response.mockReturnValueOnce('se;ok;74.00;41.08;17.17')

  const promise = client.getAllSensorValue()
  return expect(promise).resolves.toEqual({
    illuminance: 74,
    humidity: 41.08,
    temperature: 17.17
  })
})

test('reeceive error response', () => {
  response.mockReturnValueOnce('se;err;001')

  const promise = client.getAllSensorValue()
  return expect(promise).rejects.toContain('Error Code: 001')
})

test('reeceive unknown response', () => {
  response.mockReturnValueOnce('se;yyy')

  const promise = client.getAllSensorValue()
  return expect(promise).rejects.toContain('Unknown result')
})

test('reeceive mismatched response', () => {
  response.mockReturnValueOnce('xx:ok')

  const promise = client.getAllSensorValue()
  return expect(promise).rejects.toContain('Command mismatched')
})
