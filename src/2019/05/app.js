/* eslint-disable no-param-reassign */

const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');

const formatInput = async () => {
  const input = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  return input.split(',').map((item) => +item);
};

(async () => {
  try {
    const input = await formatInput();
    const result = await intcode({ input });
    await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify({ result: result[0], raw: result }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
