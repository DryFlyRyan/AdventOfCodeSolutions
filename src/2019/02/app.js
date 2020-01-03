/* eslint-disable no-param-reassign */

const fs = require('fs').promises;
const path = require('path');

const seedInput = (input, noun, verb) => input.map((num, index) => {
  if (index === 1) {
    return noun;
  }

  if (index === 2) {
    return verb;
  }

  return num;
});

const formatInput = async () => {
  const input = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  return input.split(',').map((item) => +item);
};

const handleOp = ({
  op,
  pos,
  array,
}) => {
  try {
    const inputA = array[array[pos + 1]];
    const inputB = array[array[pos + 2]];
    const outputPos = [array[pos + 3]];

    if (op === 1) {
      array[outputPos] = inputA + inputB;
    } else {
      array[outputPos] = inputA * inputB;
    }
  } catch (error) {
    console.error(error);
    console.error('op = ', op);
    console.error('pos = ', pos);
  }
};

const runProgram = (input) => {
  for (let i = 0; i < input.length; i += 4) {
    if (input[i] === 1 || input[i] === 2) {
      handleOp({ op: input[i], pos: i, array: input });
    } else if (input[i] === 99) {
      return input;
    }
  }
  return input;
};

(async () => {
  const input = await formatInput();
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      const seededInput = seedInput(input, noun, verb);
      const [result] = runProgram(seededInput);
      if (result === 19690720) {
        console.log(`results: ${noun}, ${verb}`);
        console.log('Puzzle solution: ', 100 * noun + verb);
        return;
      }
    }
  }
  console.log('No correct inputs found');
})();
