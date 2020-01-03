/* eslint-disable no-param-reassign */
const fs = require('fs').promises;


const getInfinites = (input) => input.map((ele) => {
  if (
    !input.find((item) => item.outer < ele.outer)
    || !input.find((item) => item.outer > ele.outer)
    || !input.find((item) => item.inner < ele.inner)
    || !input.find((item) => item.inner > ele.inner)
  ) {
    return {
      ...ele,
      isInfinite: true,
    };
  }
  return ele;
});

const formatInput = async () => {
  const formattedInput = await fs.readFile('./inputs/6.txt', 'utf-8')
    .then((res) => res.split('\n'))
    .then((res) => res.map((coordString) => {
      const [outer, inner] = coordString.split(', ').map((item) => parseInt(item, 10));
      return {
        outer,
        inner,
        id: Math.random().toString(36).substr(2, 5),
      };
    }));

  return getInfinites(formattedInput);
};

const getMatrixDimensions = (input) => input.reduce((matrix, item) => ({
  outerMax: item.outer > matrix.outerMax ? item.outer : matrix.outerMax,
  innerMax: item.inner > matrix.innerMax ? item.inner : matrix.innerMax,
}), { outerMax: 0, innerMax: 0 });

const searchForCoordinates = (input, outer, inner) => {
  const distancedInput = input.map((coordSet) => ({
    ...coordSet,
    distance: Math.abs(coordSet.outer - outer) + Math.abs(coordSet.inner - inner),
  })).sort((a, b) => {
    return a.distance - b.distance;
  });

  // console.log('\n\n')
  // console.log(distancedInput);
  // console.log(outer, inner)

  const [lowest, nextLowest] = distancedInput;

  if (lowest.distance !== nextLowest.distance) {
    return lowest.id;
  }

  return undefined;
};

const getAreaTotals = (input) => {
  const { outerMax, innerMax } = getMatrixDimensions(input);
  const totalsMap = {};

  for (let outer = 0; outer <= outerMax + 1; outer++) {
    for (let inner = 0; inner <= innerMax + 1; inner++) {
      const closestPin = searchForCoordinates(input, outer, inner);
      if (!totalsMap[closestPin]) {
        totalsMap[closestPin] = 1;
      } else {
        totalsMap[closestPin]++;
      }
    }
  }

  console.log(totalsMap);

  return input.filter((coordSet) => !coordSet.isInfinite)
    .map((coordSet) => ({
      ...coordSet,
      area: totalsMap[coordSet.id],
    }))
    .sort((a, b) => b.area - a.area);
};

(async () => {
  const input = await formatInput();
  const infinitizedInput = getInfinites(input);
  const areaTotals = getAreaTotals(infinitizedInput);
  console.log(areaTotals);
})();
