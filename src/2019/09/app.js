/* eslint-disable no-await-in-loop */
const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');
const intcodeFormatter = require('../_shared/intcodeInputFormatter');

;(async () => {
  try {
    const program = await intcodeFormatter(path.join(__dirname, './input.txt'));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})()