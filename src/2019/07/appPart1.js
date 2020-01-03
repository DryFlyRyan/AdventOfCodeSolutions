/* eslint-disable no-await-in-loop */
const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');
const intcodeFormatter = require('../_shared/intcodeInputFormatter');

const buildOptionsArray = (min = 0, max = 4) => {
  const optionsArray = [];
  for (let i = min; i <= max; i++) {
    optionsArray.push(i);
  }
  return optionsArray;
};

const getAllArrayCombos = (min = 0, max = 4) => {
  const optionsArray = buildOptionsArray(min, max);
  const combosArray = [];

  for (let a = min; a < optionsArray.length; a++) {
    for (let b = min; b < optionsArray.length; b++) {
      for (let c = min; c < optionsArray.length; c++) {
        for (let d = min; d < optionsArray.length; d++) {
          for (let e = min; e < optionsArray.length; e++) {
            const resultArray = [a, b, c, d, e];
            const deduped = [...new Set(resultArray)];

            if (resultArray.length === deduped.length) {
              combosArray.push(resultArray);
            }
          }
        }
      }
    }
  }

  return combosArray;
};

const runCombo = async (program, combo) => {
  let output = 0;

  for (let i = 0; i < combo.length; i++) {
    const [newOutput] = await intcode(program, { promptConfig: [combo[i], output] });
    output = newOutput;
  }

  return output;
};

const findMaxOutput = async (program, combos) => {
  let maxOutput = 0;

  for (let i = 0; i < combos.length; i++) {
    const newOutput = await runCombo(program, combos[i]);

    if (newOutput > maxOutput) {
      maxOutput = newOutput;
    }
  }

  return maxOutput;
};

(async () => {
  const startTime = new Date();
  const program = await intcodeFormatter(path.join(__dirname, './input.txt'));
  const combos = getAllArrayCombos();
  await fs.writeFile(path.join(__dirname, 'combos.json'), JSON.stringify({ combos }));
  const maxOutput = await findMaxOutput(program, combos);
  console.log('max', maxOutput);
  const endTime = new Date();
  console.log(`Operation took ${endTime - startTime}ms`);
  process.exit(0);
})();
