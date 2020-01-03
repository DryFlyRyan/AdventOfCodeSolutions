const fs = require('fs').promises;

const getMultipleOccurances = (id) => {
  const letterCounts = id.split('').reduce((letterCounts, letter) => {
    if (letterCounts[letter]) {
      return {
        ...letterCounts,
        [letter]: letterCounts[letter] + 1,
      };
    }
    return {
      ...letterCounts,
      [letter]: 1,
    }
  }, {});
  // console.log(letterCounts);

  return {
    low: !!Object.values(letterCounts).find(count => count === 2),
    high: !!Object.values(letterCounts).find(count => count === 3),
  }
}

const findVariance = (inputA, inputB) => {
  const splitInputB = inputB.split('')
  const testInput = splitInputB.filter((letter, index) => letter === inputA.charAt(index)).join('')
  // console.log(inputA, inputB, testInput)
  // console.log(inputA.length, testInput.length)
  if (inputA.length - testInput.length === 1) {
    console.log('hit')
    return testInput;
  }

  return false;
}

const getChecksumParts = (input) => input.reduce((accum, id) => {
  const {low, high} = getMultipleOccurances(id);

  // console.log('low', low, high)

  return {
    low: low ? accum.low + 1 : accum.low,
    high: high ? accum.high + 1 : accum.high,
  }
}, {
  low: 0,
  high: 0,
});

const findOffByOneIds = (input) => {
  for (let i = 0; i < input.length; i++) {
    const inputA = input[i];
    for (let x = i + 1; x < input.length; x++) {
      const inputB = input[x];
      const variance = findVariance(inputA, inputB);
      if (variance) {
        return variance;
      }
    }
  }

  return 'No variance found';
}

(async () => {
  const input = await fs.readFile('./inputs/2a.txt', 'utf-8')
    .then(res => res.split('\n'));

  const { low, high } = getChecksumParts(input);
  const checksum = low * high;

  console.log('checksum', checksum);
  const variance = findOffByOneIds(input);
  console.log('variance', variance);
})();