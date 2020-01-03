/* eslint-disable no-param-reassign */
const fs = require('fs').promises;

const polymerReaction = (input, index = 0) => {
  for (index; index < input.length; index++) {
    const currentUnit = input[index];
    const nextUnit = input[index + 1];

    // console.log(currentUnit, nextUnit)
    if (
      index < input.length - 1
      && currentUnit !== nextUnit
      && (currentUnit.toLowerCase() === nextUnit.toLowerCase())
    ) {
      input.splice(index, 2);
      if (index) {
        index -= 2;
      } else {
        index--;
      }
    }
  }
  return input;
};

const buildUnitMap = (input) => input.reduce((unitMap, letter, index) => {
  if (!unitMap[letter.toLowerCase()]) {
    console.log('Filtering Polymer: ', letter);
    const reducedPolymer = input.filter((unit) => unit !== letter.toLowerCase() && unit !== letter.toUpperCase());
    if (!index) {
      console.log(reducedPolymer);
    }
    return {
      ...unitMap,
      [letter.toLowerCase()]: reducedPolymer,
    };
  }
  return unitMap;
}, {});

const runPolymerReactions = (unitMap) => Object.keys(unitMap).reduce((updatedMap, letter) => {
  const reactedPolymer = polymerReaction(unitMap[letter]);

  return {
    ...updatedMap,
    [letter]: reactedPolymer.length,
  };
}, {});

(async () => {
  const input = await fs.readFile('./inputs/5.txt', 'utf-8').then((res) => res.split(''));
  console.log(input.length);
  const unitMap = buildUnitMap(input);
  await fs.writeFile('./testData/05.txt', JSON.stringify(unitMap));
  const reducedPolymers = runPolymerReactions(unitMap);

  console.log(reducedPolymers);
})();
