import fs from 'fs'
import path from 'path'
import log from 'ololog'


export const main = async () => {
  const entries = await parseFile(getFilePath())
  const { drivers, travel } = parseEntries(...entries)
  return render(drivers, travel)
}

export const getFilePath = () => {
  const file = process.argv[2]

  if (file === undefined) {
    log(`
      no file provided
    `)
    process.exit(-1)
  }

  return path.join(__dirname, file)
}

export const render = (drivers, travel) => {
  return log.bright.magenta(
    [...drivers]
      .map(driver => {
        if (!travel[driver]) {
          // if driver has no trips set miles to 0 and duration to 1 so we don't throw dividing by 0
          return {driver, miles: 0, duration: 1}
        }
        return {driver, ...travel[driver]}
      })
      .map(({ driver, miles, duration }) => ({driver, miles, mph: miles / duration}))
      .sort(({ miles: miles1 }, { miles: miles2 }) => miles2 - miles1)
      .map(({ driver, miles, mph }) => {
        if (miles) {
          return `${driver}: ${Math.round(miles)} miles @ ${Math.round(mph)} mph`
        }
        return `${driver}: 0 miles`
      })
      .join('\n')
  )
}

export const parseDriver = entry => {
  if (entry.length !== 2) {
    log(`
      invalid driver entry
      ${entry}
    `)
    process.exit(4)
  }
  return entry[1]
}

export const findDuration = (startTime, endTime) => {
  const startTimeHours = Number(startTime.split(':')[0])
  const startTimeMinutes = Number(startTime.split(':')[1])
  const endTimeHours = Number(endTime.split(':')[0])
  const endTimeMinutes = Number(endTime.split(':')[1])

  return endTimeHours + endTimeMinutes / 60 - startTimeHours - startTimeMinutes / 60
}

export const isValidSpeed = mph => mph >= 5 && mph <= 100

export const parseTrip = entry => {
  validateParseTrip(entry)

  const [ _, driver, startTime, endTime, miles ] = entry
  const duration = findDuration(startTime, endTime)

  if (Number(duration) && isValidSpeed(Number(miles) / Number(duration))) {
    return {
      driver,
      duration,
      miles: Number(miles)
    }
  }
  return null
}

export const parseEntries = (entry, ...entries) => {
  const defaultValues = {
    drivers: new Set(),
    travel: {}
  }

  if (entry === undefined) {
    return defaultValues
  }

  let { drivers, travel } = parseEntries(...entries) || defaultValues

  if (entry[0] === 'Driver') {
    drivers.add(parseDriver(entry))

  } else if (entry[0] === 'Trip') {
    const trip = parseTrip(entry)

    if (trip) {
      const {driver, miles, duration} = trip
      travel[driver] = travel[driver] || {miles: 0, duration: 0}

      travel[driver].miles += miles
      travel[driver].duration += duration
    }
  } else {
    log(`
      Invalid input.
      Every line in input must start with "Driver" or "Trip".
    `)
    return process.exit(2)
  }
  return {drivers, travel}
}

export const parseFile = filePath => {
  return readFileAsync(filePath)
    .then(data => {
      return data
        .split('\n')
        .filter(line => line !== '')
        .map(line => line.split(' '))

    })
    .catch(() => {
      log(`
        unable to read filetype:
        ${filePath}
      `)
      return process.exit(1)
    })
}

// library code

export const readFileAsync = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

export const isTime = str => {
  const time = str.split(':')
  return (
    time.length === 2 &&
    !isNaN(time[0]) &&
    !isNaN(time[1]) &&
    Number.isInteger(Number(time[0])) &&
    Number.isInteger(Number(time[1])) &&
    time[0] >= 1 &&
    time[0] <= 24 &&
    time[1] >= 0 &&
    time[1] <= 59
  )
}

export const validateParseTrip = entry => {
  if (
    entry.length !== 5 ||
    !isTime(entry[2]) ||
    !isTime(entry[3]) ||
    isNaN(entry[4])
  ) {
    log(`
      Invalid trip
      ${entry.join(' ')}
    `)
    return process.exit(5)
  }
}

if (require.main === module) {
  main()
}
