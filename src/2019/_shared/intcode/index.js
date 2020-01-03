/* eslint-disable no-param-reassign, class-methods-use-this, no-await-in-loop */
const readline = require('readline');

const ADD = '01'; // Add
const MUL = '02'; // Multiply
const INP = '03'; // Input
const OUT = '04'; // Output
const JIT = '05'; // Jump-if-true
const JIF = '06'; // Jump-if-false
const LTH = '07'; // Less Than
const EQU = '08'; // Equals
const REL = '09'; // Update Relative Base
const END = '99'; // Stop

class Intcode {
  constructor({
    program,
    noun,
    verb,
    programInput,
    waitOnOutput = false,
  } = {}) {
    this.program = [...program];
    this.program[1] = noun !== undefined ? noun : this.program[1];
    this.program[2] = verb !== undefined ? verb : this.program[2];

    this.programInput = programInput;
    this.done = false;
    this.waiting = false;
    this.waitOnOutput = waitOnOutput;
    this.currentPosition = 0;
    this.relativeBase = 0;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  
  [ADD](value1, value2) {
    this.program[this.program[this.currentPosition + 3]] = value1 + value2;
    this.currentPosition += 4;
  }

  [MUL](value1, value2) {
    this.program[[this.program[this.currentPosition + 3]]] = value1 * value2;
    this.currentPosition += 4;
  }

  async [INP]() {
    let opInput;

    if (this.programInput.length) {
      opInput = +this.programInput[0]; // eslint-disable-line
      this.programInput.shift();
    } else {
      return new Promise((resolve) => {
        return this.rl.question('Enter next input:', (input) => {
          resolve(input);
        });
      }).then((input) => {
        this.rl.close();
        opInput = +input;
      });
    }

    this.program[this.program[this.currentPosition + 1]] = opInput;
    this.currentPosition += 2;
  }

  [OUT](value1) {
    this.program[0] = value1;
    this.currentPosition += 2;
  }

  [JIT](value1, value2) {
    this.currentPosition = value1 ? value2 : this.currentPosition + 3;
  }

  [JIF](value1, value2) {
    this.currentPosition = value1 ? this.currentPosition + 3 : value2;
  }

  [LTH](value1, value2) {
    this.program[this.program[this.currentPosition + 3]] = value1 < value2 ? 1 : 0;
    this.currentPosition += 4;
  }

  [EQU](value1, value2) {
    this.program[this.program[this.currentPosition + 3]] = value1 === value2 ? 1 : 0;
    this.currentPosition += 4;
  }

  [REL](value1) {
    this.relativeBase += value1;
    
  }
  
  [END]() {}

  generateOpValues(params) {
    return params.map((param, index) => {
      const targetPosition = this.currentPosition + index + 1;
      switch(param) {
        case '2': {
          const paramValue = this.program[targetPosition];
          const relativeAddress = this.relativeBase + paramValue;
          return this.program[relativeAddress];
        }

        case '1':
          return this.program[targetPosition];
   
        case '0':
        default:
          return this.program[this.program[targetPosition]];
      }
    })
  }

  processOpCode(opCode) {
    const stringifiedOp = String(opCode).padStart(5, '0');
    const params = stringifiedOp.slice(0, -2).split('').reverse()
    const values = this.generateOpValues(params);
    
    return {
      opCode: stringifiedOp.substr(-2),
      values,
    };
  }

  async run() {
    while (!this.waiting) {
      const { opCode, values } = this.processOpCode(this.program[this.currentPosition]);
      if (opCode === END) {
        this.waiting = true;
        this.done = true;
        break;
      }

      await this[opCode](...values);
      
      if (opCode === OUT && this.waitOnOutput) {
        this.waiting = true;
        break;
      }
    }
  }

  async start() {
    try {
      await this.run();

      return {
        output: this.program[0],
        done: this.done,
      };
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  async resume({ programInput }) {
    try {
      this.programInput = [...this.programInput, ...programInput];
      this.waiting = false;
      await this.run();

      return {
        output: this.program[0],
        done: this.done,
      };
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

module.exports = Intcode;
