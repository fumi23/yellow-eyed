import YellowEyed from './index'

const client = new YellowEyed('127.0.0.1')

function mockResponse(message: string) {
  jest.spyOn(client as any, 'sendCommand').mockReturnValue(Promise.resolve(message))
}

describe('getAllSensorValue', () => {
  const subject = () => client.getAllSensorValue()

  test('receive ok response', async () => {
    mockResponse('se;ok;74.00;41.08;17.17')

    await expect(subject()).resolves.toEqual({
      illuminance: 74,
      humidity: 41.08,
      temperature: 17.17
    })
  })

  test('receive error response', async () => {
    mockResponse('se;err;001')

    await expect(subject()).rejects.toThrow('Error Code: 001')
  })

  test('receive unknown response', async () => {
    mockResponse('se;yyy')

    await expect(subject()).rejects.toThrow('Unknown result')
  })

  test('receive mismatched response', async () => {
    mockResponse('xx:ok')

    await expect(subject()).rejects.toThrow('Command mismatched')
  })
})
