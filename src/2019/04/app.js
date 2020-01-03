const fs = require('fs').promises;
const path = require('path');

const lowRange = 347312;
const highRange = 805915;


const hasDoubles = (testNum) => {
  const multiples = {};
  const stringArray = String(testNum).split('');

  for (let i = 0; i < stringArray.length - 1; i++) {
    if (stringArray[i + 1] === stringArray[i]) {
      if (multiples[stringArray[i]]) {
        multiples[stringArray[i]]++;
      } else {
        multiples[stringArray[i]] = 2;
      }
    }
  }

  // console.log('test number = ', testNum, 'Multi object', multiples);
  if (Object.values(multiples).find((val) => val === 2)) {
    return multiples;
  }

  return false;
};

const isAscending = (testNum) => {
  const stringArray = String(testNum).split('');

  for (let i = 0; i < stringArray.length - 1; i++) {
    if (+stringArray[i + 1] < +stringArray[i]) {
      return false;
    }
  }

  return true;
};

const runner = () => {
  const counter = [];
  for (let i = lowRange; i <= highRange; i++) {
    if (hasDoubles(i) && isAscending(i)) {
      const count = hasDoubles(i);
      counter.push({ test: i, count });
    }
  }

  return counter;
};

(async () => {
  const results = runner();
  await fs.writeFile(path.join(__dirname, 'output.js'), JSON.stringify({ results }));
  console.log(results.length);
  // console.log(results);
})();
