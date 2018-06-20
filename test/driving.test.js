import {
  render,
  parseDriver,
  findDuration,
  isValidSpeed,
  parseTrip,
  parseEntries,
  parseFile,
  isTime,
} from '../driving.js'

describe('render', () => {
  const drivers = new Set(['driver1'])

  it('render should render the miles and mph of a driver', () => {
    const travel = {
      driver1: {
        miles: 20,
        duration: 1
      }
    }
    const rendered = render(drivers, travel)
    expect(rendered).toBe('driver1: 20 miles @ 20 mph')
  })

  it('render should correctly render a driver with no trips', () => {
    const travel = {}
    const rendered = render(drivers, travel)
    expect(rendered).toBe(`driver1: 0 miles`)
  })

  it('it should round miles and duration', () => {
    const travel = {
      driver1: {
        miles: 19.9,
        duration: .99
      }
    }
    const rendered = render(drivers, travel)
    expect(rendered).toBe(`driver1: 20 miles @ 20 mph`)
  })

  it('render should render multiple drivers in order of miles driven', () => {
    const drivers = new Set([
      'driver1',
      'driver2',
      'driver3'
    ])
    const travel = {
      driver1: {
        miles: 20,
        duration: 1
      },
      driver3: {
        miles: 15.9,
        duration: 2
      }
    }
    const rendered = render(drivers, travel)
    expect(rendered).toBe(
      [
        'driver1: 20 miles @ 20 mph',
        'driver3: 16 miles @ 8 mph',
        'driver2: 0 miles'
      ].join('\n')
    )
  })
})

describe('parse driver', () => {
  it('should parse a driver', () => {
    expect(parseDriver(['Driver', 'Dan'])).toBe('Dan')
  })
})

describe('findDuration', () => {
  it('should correctly find duration between endTime and startTime', () => {
    const duration = findDuration('12:30', '14:45')
    expect(duration).toBe(2.25)
  })
})

describe('isValidSpeed', () => {
  it('should return true for a speed between 5mph and 100mph', () => {
    expect(isValidSpeed(5)).toBe(true)
    expect(isValidSpeed(100)).toBe(true)
    expect(isValidSpeed(24)).toBe(true)
  })

  it('should return false for a speed that is not between 5mph and 100mph', () => {
    expect(isValidSpeed(4)).toBe(false)
    expect(isValidSpeed(102)).toBe(false)
  })
})

describe('parseTrip' , () => {
  it('should return null for an invalid speed', () => {
    const entry = [ 'Trip', 'Dan', '07:15', '07:20', '1000']
    const result = parseTrip(entry)
    expect(result).toBe(null)
  })

  it('should not return null (not throw) if duration is 0', () => {
    const entry = ['Trip', 'Dan', '07:15', '07:15', '10']
    const result = parseTrip(entry)
    expect(result).toBe(null)
  })

  it('should return the driver, duration and miles for a valid entry', () => {
    const entry = ['Trip', 'Dan', '07:15', '08:15', '10']
    const result = parseTrip(entry)
    expect(result).toEqual({
      driver: 'Dan',
      duration: 1,
      miles: 10
    })
  })
})

describe('parseEntries', () => {
  it('should return empty values no arguments supplied', () => {
    const result = parseEntries()
    expect(result).toEqual({
      drivers: new Set(),
      travel: {}
    })
  })

  it('should parse a driver entry', () => {
    const entry = ['Driver', 'Dan']
    const result = parseEntries(entry)
    expect(result).toEqual({
      drivers: new Set(['Dan']),
      travel: {}
    })
  })

  it('should parse a travel entry', () => {
    const entry = ['Trip', 'Dan', '07:15', '08:15', '10']
    const result = parseEntries(entry)
    expect(result).toEqual({
      drivers: new Set(),
      travel: {
        Dan: {
          miles: 10,
          duration: 1
        }
      }
    })
  })

  it('should correctly parse multiple entries', () => {
    const entries = [
      ['Driver', 'Dan'],
      ['Driver', 'Fred'],
      ['Trip', 'Dan', '07:15', '08:15', '10'],
      ['Trip', 'Fred', '07:15', '08:15', '10'],
      ['Trip', 'Fred', '12:15', '13:15', '20']
    ]
    const result = parseEntries(...entries)
    expect(result).toEqual({
      drivers: new Set(['Dan', 'Fred']),
      travel: {
        Dan: {
          miles: 10,
          duration: 1
        },
        Fred: {
          miles: 30,
          duration: 2
        }
      }
    })
  })
})


describe('parseFile', () => {
  it('should parse a file', async () => {
    const filePath = 'test/data/test1.txt'
    const result = await parseFile(filePath)
    expect(result).toEqual([
      ['Driver', 'Dan'],
      ['Driver', 'Alex'],
      ['Driver', 'Bob'],
      ['Trip', 'Dan', '07:15', '07:45', '17.3'],
      ['Trip', 'Dan', '06:12', '06:32', '21.8'],
      ['Trip', 'Alex', '12:01', '13:16', '42.0']
    ])
  })
})

describe('isTime', () => {
  it('should return true for a string that is a time', () => {
    expect(isTime('15:30')).toBe(true)
  })

  it('should return false for inputs that are not times', () => {
    expect(isTime('0:30')).toBe(false)
    expect(isTime('15:15:15')).toBe(false)
    expect(isTime('billy:billy')).toBe(false)
    expect(isTime('12.33:15')).toBe(false)
    expect(isTime('25:00')).toBe(false)
    expect(isTime('12:66')).toBe(false)
  })
})