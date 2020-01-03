/* eslint-disable no-param-reassign */

const fs = require('fs').promises;

const markFabric = (
  baseArray,
  {
    outerStartIndex,
    outerEndIndex,
    innerStartIndex,
    innerEndIndex,
  },
) => {
  for (let outer = outerStartIndex; outer < outerEndIndex; outer++) {
    // console.log('outer index = ', outer);
    if (!baseArray[outer]) {
      baseArray[outer] = [];
    }

    for (let inner = innerStartIndex; inner < innerEndIndex; inner++) {
      if (!baseArray[outer][inner]) {
        baseArray[outer][inner] = 1;
      } else if (typeof (baseArray[outer][inner]) === 'number') {
        baseArray[outer][inner] = baseArray[outer][inner]++;
      }
    }
  }
};

const mapClaims = (formattedInput) => {
  const baseArray = [];

  formattedInput.forEach((claim) => markFabric(baseArray, claim));

  return baseArray;
};

const countSharedFabricSquares = (fabricArray) => fabricArray.reduce((totalSquares, inner) => {
  if (!inner) {
    return totalSquares;
  }

  const innerCount = inner.reduce((count, ele) => {
    if (
      typeof (ele) !== 'number'
      || ele === 1
    ) {
      return count;
    }

    return count + 1;
  }, 0);

  return totalSquares + innerCount;
}, 0);

const checkForPurity = (fabricArray, claims) => claims.filter((claim) => {
  const {
    outerStartIndex,
    outerEndIndex,
    innerStartIndex,
    innerEndIndex,
  } = claim;

  for (let outer = outerStartIndex; outer < outerEndIndex; outer++) {
    for (let inner = innerStartIndex; inner < innerEndIndex; inner++) {
      if (fabricArray[outer][inner] !== 1) {
        return false;
      }
    }
  }

  return true;
});

(async () => {
  try {
    const rawInput = await fs.readFile('./inputs/3.txt', 'utf-8')
      .then((res) => res.split('\n'));

    const formattedInput = rawInput.map((specString) => {
      const [id, left, top, width, height] = specString.split(/#|\s@\s|:\s|,|x/g).filter(Boolean);
      return {
        id,
        outerStartIndex: parseInt(top, 10),
        outerEndIndex: parseInt(top, 10) + parseInt(height, 10),
        innerStartIndex: parseInt(left, 10),
        innerEndIndex: parseInt(left, 10) + parseInt(width, 10),
      };
    });

    const markedArray = mapClaims(formattedInput);

    const sharedFabric = countSharedFabricSquares(markedArray);

    const pureClaims = checkForPurity(markedArray, formattedInput);

    console.log(sharedFabric);
    console.log('pure claims:', pureClaims);
  } catch (err) {
    console.error(err);
  }
})();
