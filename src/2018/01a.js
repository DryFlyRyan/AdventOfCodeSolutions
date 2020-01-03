const fs = require('fs');

const input = fs.readFileSync('./inputs/1a.txt', 'utf-8')
const splitInput = input.split('\n');
const freqChange = splitInput.reduce((sum, item) => {
  const op = item.slice(0, 1);
  const num = parseInt(item.slice(1), 10);
  console.log('sum', num)
  if (op === '+') {
    return sum + num
  }
  return sum - num;
}, 0);

console.log(freqChange)
// console.log('input', splitInput)