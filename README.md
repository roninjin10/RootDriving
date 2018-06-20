# Root Driver Tracker (take home coding problem)

The [Root](https://www.joinroot.com/) Driver Tracker takes in a space and new line seperated text file and prints out the miles traveled and average speed to the console.

### Features:
- [node.js](https://nodejs.org/en/)
- ES2017+ support with [Babel](https://babel.js.io/)
- Linting with [ESLint](http://eslint.org/)
- Testing with [Jest](https://facebook.github.io/jest/)

## Getting started

# Install dependencies
npm install

### Testing

Testing is powered by [Jest](https://facebook.github.io/jest/).

Start the test runner with:

npm test

You can also generate coverage with:

npm test -- --coverage

### Running

To try it out on a sample make sure npx is installed and run

npm run start

To run it it on any file just run

npx babel-node driving.js file

Or alternatively transpile it with babel and run it with node instead of npx babel-node

### Linting

Linting is set up using [ESLint](http://eslint.org/). It uses ESLint's default [eslint:recommended](https://github.com/eslint/eslint/blob/master/conf/eslint.json) rules. Feel free to use your own rules and/or extend another popular linting config (e.g. [airbnb's](https://www.npmjs.com/package/eslint-config-airbnb) or [standard](https://github.com/feross/eslint-config-standard)).

Begin linting in watch mode with:

npm run lint

## FAQ

**Why ololog instead of console.log?**

ololog provides a lot more functionality including the ability to both log and return an argument.

**Why is the code so functional**

Functional programming is when we avoid mutating data and functions have no side effects.  By doing this we have a few advantages.

1. Our code is modular and easy to reason about because there are no side effects.
2. Because our functions are pure they can be very easily unit tested.

**Why use babel and make such an in depth README for such simple functionality?**

To showcase the professional production level code I am capable of making.

**Can you tell me about the main function**

The main function is the entry point for the driving.js module.  If require.main === module (aka we aren't importing the file and running tests) then main gets called and the whole program runs.  We use async await for readability when dealing with the asyncronous nature of reading a file.   After we parse the file we then parse the individual entries and destructure them into the drivers and travel variables.  We then call render to render it to the console.

**Can you tell me about this render function?**

Render composes higher order functions for readability into strings representing each driver and then joins them with a new line character.  I made the decision to default drivers that have no travel data to a duration of 1 to maintain the readability of the rest of the code.  I try to write code that is so readable it doesn't need comments, but in this case because it isn't immediately intuitive it required a comment.

In order the psuedocode for this function is

Log and return
  all drivers
    get their miles and duration

    then calculate their mph

    then sort by mph

    then build the string to be rendered and round the mph and miles

    then join with new line character


**Can you tell me about parseDriver?**

Parse driver first validates that the entry is in the proper format and then returns the name of the driver.  It's a very simple function but seperating conserns is important for both readability and scalability.

**Can you tell me about findDuration?**

findDuration takes in two strings, the start time and the end time, and calculates how much time in the form of decimal hours has elapsed.

**How about isValidSpeed?**

isValidSpeed just checks to see if the mph is between 5 and 100.  By having it as it's own function we both seperate our concerns and can easily find where to look if in the future we want to change the range of speeds we want track or throw out as outliers.

**Tell me about parseTrip.**

The validation for parseTrip is complicated enough to warrant it's own function for readability reasons.  After validating, we destructure the entry into the relavent variables we need.  If isValidSPeed returns true we return the driver duration and miles to be added to their total otherwise we return null if not a valid speed.

**Tell me about paseEntries.  It seems like one of the more complicated functions and has recursion**

It is a bit longer than most of the functions and has most of the logic for this module.  In a functional style, it uses recursion instead of for loops.  Partly because this is good functional style and partly because I wanted to show off that I can turn a for loop into a recursive function.

It figures out what type of entry the current entry is and then parses it accordingly.  At the end it returns both the drivers as a set and the travel information as an object.

**What does parseFile do**

The data provided in the file is easier to work with in JavaScript if we first turn it into an array of arrays split by new line characters and then by spaces.

**What is the Promise thing you are doing in readFileAsync?**

Promises lead to much more readable code than callbacks.  Because of this I decided to make a function that returns a promise for reading files.

**Does isTime do what I think it does?**

Yes.  Good variable naming is important and isTime does exactly what it says and checks a string to see if it is a time.

**Why is validateParseTrip at the bottom of the file?**

I put the functions that have less to do with the logic of how this module works towards the bottom such as readFileAsync, isTime, and validateParseTrip.  I considered breaking some of this stuff up into it's own files but this module is doing so little it doesn't make sense unless some of these functions get reused elsewhere in future to break it up.