/**
 * (Math.floor(mass / 3)) - 2
 */

const fs = require('fs').promises;
const path = require('path');

const calculateRequiredFuel = (mass) => (Math.floor(mass / 3)) - 2;

const formatInput = async () => {
  try {
    const input = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
    return input.split('\n').map((item) => +item);
  } catch (error) {
    console.error(error);
  }
};

const calculateToNothing = (mass, sum = 0) => {
  const requiredFuel = calculateRequiredFuel(mass);

  if (requiredFuel > 0) {
    return calculateToNothing(requiredFuel, sum + requiredFuel);
  }

  return sum;
};

const calculateTotalFuel = (input) => input.reduce((sum, mass) => {
  const requiredFuel = calculateToNothing(mass);
  return sum + requiredFuel;
}, 0);

(async () => {
  const input = await formatInput();
  const totalFuel = calculateTotalFuel(input);
  console.log(totalFuel);
})();
