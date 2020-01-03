const fs = require('fs');

const input = fs.readFileSync('./inputs/1a.txt', 'utf-8')
const splitInput = input.split('\n');
const sumArray = [0];
let matchingSums = [];
let cycles = 0;
const calculateSum = () => {
  for (let i = 0; i < splitInput.length; i++) {
    const item = splitInput[i];
    const prevSum = sumArray[sumArray.length - 1];
    const op = item.slice(0, 1);
    const num = parseInt(item.slice(1), 10);
    let sum;

    if (op === '+') {
      sum = prevSum + num;
    } else {
      sum = prevSum - num;
    }

    if (sumArray.find((item) => item === sum)) {
      matchingSums.push(sum);
      return;
    }

    sumArray.push(sum);

    if (i === splitInput.length - 1) {
      cycles++;
      calculateSum();
    }

  }
}

while (matchingSums.length < 1) {
  calculateSum();
}


console.log(matchingSums, cycles)

// console.log(freqChange)
// console.log('input', splitInput)