const fs = require('fs').promises;
const path = require('path');

module.exports = async (targetPath) => {
  const input = await fs.readFile(targetPath, 'utf-8');
  return input.split(',').map((item) => +item);
};
