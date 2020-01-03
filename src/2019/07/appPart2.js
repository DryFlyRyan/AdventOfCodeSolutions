/* eslint-disable no-await-in-loop */
const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');
const intcodeFormatter = require('../_shared/intcodeInputFormatter');

const getAllArrayCombos = (min = 0, max = 4) => {
  const combosArray = [];

  for (let a = min; a <= max; a++) {
    for (let b = min; b <= max; b++) {
      for (let c = min; c <= max; c++) {
        for (let d = min; d <= max; d++) {
          for (let e = min; e <= max; e++) {
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
  const computers = Array(combo.length);
  let output = 0;
  let count = 0;

  while (true) {
    const position = count % combo.length;

    if (!computers[position]) {
      const programInput = [combo[position], output];
      computers[position] = new intcode({ program, programInput });
    }

    const computer = computers[position];

    const result = count < combo.length
      ? await computer.start()
      : await computer.resume({ programInput: [output] })
    
    output = result.output;
    count++

    if (result.done && position === combo.length - 1) {
      break;
    }
  }

  // console.log('count: ', count);
  return output;
};

const findMaxOutput = async (program, combos) => {
  let maxOutput = 0;

  for (let i = 0; i < combos.length; i++) {
    const newOutput = await runCombo(program, combos[i]);
    // console.log(combos[i], newOutput)
    if (newOutput > maxOutput) {
      maxOutput = newOutput;
    }
  }

  return maxOutput;
};

(async () => {
  const startTime = new Date();
  const program = await intcodeFormatter(path.join(__dirname, './input.txt'));
  const combos = getAllArrayCombos(5, 9);
  await fs.writeFile(path.join(__dirname, 'combos.json'), JSON.stringify({ combos }));
  const maxOutput = await findMaxOutput(program, combos);
  console.log('max', maxOutput);
  const endTime = new Date();
  console.log(`Operation took ${endTime - startTime}ms`);
  process.exit(0);
})();
