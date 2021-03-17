import YellowEyed from './index'

const client = new YellowEyed('127.0.0.1')

function mockResponse(message: string) {
  jest.spyOn(client as any, 'sendCommand').mockReturnValue(Promise.resolve(message))
}

describe('getIlluminanceValue', () => {
  const subject = () => client.getIlluminanceValue()

  test('receive ok response', async () => {
    mockResponse('li;ok;74.00')

    await expect(subject()).resolves.toEqual({
      illuminance: 74
    })
  })

  test('receive error response', async () => {
    mockResponse('li;err;001')

    await expect(subject()).rejects.toThrow('Error Code: 001')
  })

  test('receive unknown response', async () => {
    mockResponse('li;yyy')

    await expect(subject()).rejects.toThrow('Unknown result')
  })

  test('receive mismatched response', async () => {
    mockResponse('xx:ok')

    await expect(subject()).rejects.toThrow('Command mismatched')
  })
})

describe('getHumidityValue', () => {
  const subject = () => client.getHumidityValue()

  test('receive ok response', async () => {
    mockResponse('hu;ok;41.08')

    await expect(subject()).resolves.toEqual({
      humidity: 41.08
    })
  })

  test('receive error response', async () => {
    mockResponse('hu;err;001')

    await expect(subject()).rejects.toThrow('Error Code: 001')
  })

  test('receive unknown response', async () => {
    mockResponse('hu;yyy')

    await expect(subject()).rejects.toThrow('Unknown result')
  })

  test('receive mismatched response', async () => {
    mockResponse('xx:ok')

    await expect(subject()).rejects.toThrow('Command mismatched')
  })
})

describe('getTemperatureValue', () => {
  const subject = () => client.getTemperatureValue()

  test('receive ok response', async () => {
    mockResponse('te;ok;17.17')

    await expect(subject()).resolves.toEqual({
      temperature: 17.17
    })
  })

  test('receive error response', async () => {
    mockResponse('te;err;001')

    await expect(subject()).rejects.toThrow('Error Code: 001')
  })

  test('receive unknown response', async () => {
    mockResponse('te;yyy')

    await expect(subject()).rejects.toThrow('Unknown result')
  })

  test('receive mismatched response', async () => {
    mockResponse('xx:ok')

    await expect(subject()).rejects.toThrow('Command mismatched')
  })
})

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
