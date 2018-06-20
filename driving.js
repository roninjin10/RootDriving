const fs = require('fs')
const path = require('path')

let drivers = new Set()
let trips = {}

const main = async () => {
  await parseFile(getFilePath())
  render()
}

const getFilePath = () => {
  const file = process.argv[2]

  if (file === undefined) {
    console.log(`
      no file provided
    `)
    process.exit(-1)
  }
  
  return path.join(__dirname, file)
}

const render = () => {
  const out = [...drivers]
    .map(driver => {
      if (!trips[driver]) {
        // if driver has no trips set miles to 0 and duration to 1 so we don't throw dividing by 0
        return {driver, miles: 0, duration: 1}
      }
      return {driver, ...trips[driver]}
    })
    .map(({ driver, miles, duration }) => ({driver, miles, mph: miles / duration}))
    .map(({ driver, miles, mph }) => {
      if (miles) {
        return `${driver}: ${miles} miles @ ${mph} mph`
      }
      return `${driver}: 0 miles`
    })
    .join('\n')

  console.log(out)
}

const parseDriver = entry => {
  validateParseDriver(entry)
  drivers.add(entry[1])
}

const findDuration = (startTime, endTime) => {
  const startTimeHours = Number(startTime.split(':')[0])
  const startTimeMinutes = Number(startTime.split(':')[1])
  const endTimeHours = Number(endTime.split(':')[0])
  const endTimeMinutes = Number(endTime.split(':')[1])

  return endTimeHours + endTimeMinutes / 60 - startTimeHours - startTimeMinutes / 60 
}

const isValidSpeed = mph => mph >= 5 && mph <= 100

const parseTrip = entry => {
  validateParseTrip(entry)
  
  const [ _, driver, startTime, endTime, miles ] = entry
  const duration = findDuration(startTime, endTime)
  
  if (isValidSpeed(miles / duration)) {
    trips[driver] = trips[driver] || {miles: 0, duration: 0}
    
    trips[driver].miles += miles
    trips[driver].duration += duration
  }
}

const parseLine = entry => {
console.log(entry)
  if (entry[0] === 'Driver') {
    return parseDriver(entry)
  } else if (entry[0] === 'Trip') {
    return parseTrip(entry)
  } else {
    console.log(`
      Invalid input.
      Every line in input must start with "Driver" or "Trip".
    `)
    return process.exit(2)
  }
}

const parseFile = filePath => {
  return readFileAsync(filePath)
    .then(data => {
      return data
        .split('\n')
        .filter(line => line !== '')
        .map(line => line.split(' '))
        .forEach(parseLine)

    })
    .catch(err => {
      console.log(err)
      console.log(`
        unable to read filetype:
        ${filePath}
      `)
      return process.exit(1)
    })
}

// library code

const readFileAsync = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

// validation

const validateParseDriver = entry => {
  if (entry.length !== 2) {
    console.log(`
      Invalid driver entry.
      ${entry.join(' ')}
    `)  
    return process.exit(3)
  }
  if (drivers.has(entry[1])) {
    console.log(`
      Duplicate driver
      entry[1]
    `)
    return process.exit(4)
  }
}

const isTime = str => {
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

const validateParseTrip = entry => {
  if (
    entry.length !== 5 ||
    !isTime(entry[2]) ||
    !isTime(entry[3]) ||
    isNaN(entry[4])
  ) {
    console.log(entry.length)
    console.log(isTime(entry[3]))
    console.log(isNaN(entry[4]))
    console.log(`
      Invalid trip
      ${entry.join(' ')}
    `)
    return process.exit(5)
  }
}

main()
