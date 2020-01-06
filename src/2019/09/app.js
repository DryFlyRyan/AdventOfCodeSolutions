/* eslint-disable no-await-in-loop, no-extra-semi */
const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');
const intcodeFormatter = require('../_shared/intcodeInputFormatter');

;(async () => {
  try {
    const program = await intcodeFormatter(path.join(__dirname, './input.txt'));
    // const program = await intcodeFormatter(path.join(__dirname, './testInput_16Digit.txt'));
    // const program = await intcodeFormatter(path.join(__dirname, './testInput_largeOutput.txt'));
    // const program = await intcodeFormatter(path.join(__dirname, './testInput_programCopy.txt'));
    await fs.writeFile(path.join(__dirname, 'origProgram.json'), JSON.stringify({ program }));

    const result = await new intcode({ program, programInput: [2] }).start();
    console.log('Final Output: ',result.output);
    await fs.writeFile(path.join(__dirname, 'program.json'), JSON.stringify({ program: result.program }));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
