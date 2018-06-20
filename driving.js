const fs = require('fs')

let drivers = new Set()
let trips = {}

const main = async () => {
  await parseFile(getFilePath())
  render()
}

const getFilePath = () => {
  const path = process.argv[2]

  if (path === undefined) {
    console.log(`
      no path provided
    `)
    process.exit(-1)
  }
  
  return path
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
    .map(({ driver, miles, duration }) => {driver, miles, mph: miles / duration})
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
  const startTimeHours = Number(startTime.split(':')[0]))
  const startTimeMinutes = Number(startTime.split(':')[1])
  const endTimeHours = Number(endTime.split(':')[0])
  const endTimeMinutes = Number(endTime.split(':')[1])

  return endTimeHours + endTimeMinutes / 60 - startTimeHours - startTimeMinutes / 60 
}

const isValidTrip = (duration, miles) => {
  const mph = miles / duration
  return mph >= 5 && mph <= 100
} 

const parseTrip = entry => {
  validateParseTrip(entry)
  
  const [ _, driver, startTime, endTime, miles ] = entry
  const duration = findDuration(startTime, endTime)
  
  if (isValidTrip(duration, miles)) {
    trips[driver] = trips[driver] || {miles: 0, duration: 0}
    
    trips[driver].miles += miles
    trips[driver].duration += duration
  }
}

const parseLine = entry => {
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
        .map(line => line.split(' '))
        .forEach(parseLine)

    })
    .catch(err => {
      console.log(`
        unable to read filetype:
        ${filePath}
      `)
      return process.exit(1)
    })
}

// library code

const readFileAsync = filePath => {
  new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    }
  }
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

const validateParseTrip = entry => {
  if (
    entry.length !== 5 ||
    !isTime(entry[2]) ||
    !isTime(entry[3]) ||
    isNaN(entry[4])
  ) {
    console.log(`
      Invalid trip
      ${entry.join(' ')}
    `)
    return process.exit(5)
  }
}

main()
