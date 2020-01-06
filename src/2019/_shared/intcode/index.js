/* eslint-disable no-param-reassign, class-methods-use-this, no-await-in-loop */
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path')

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
    program = [],
    noun,
    verb,
    programInput = [],
    waitOnOutput = false,
    timeout = 10000,
    reportTime = true,
    pauseOnOp = false,
  } = {}) {
    this.program = [...program];
    this.program[1] = noun !== undefined ? noun : this.program[1];
    this.program[2] = verb !== undefined ? verb : this.program[2];

    this.done = false;
    this.currentPosition = 0;
    this.pauseOnOp = pauseOnOp;
    this.programInput = programInput;
    this.relativeBase = 0;
    this.reportTime = reportTime;
    this.startTime = new Date();
    this.timeout = timeout;
    this.waiting = false;
    this.waitOnOutput = waitOnOutput;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.opCodes = {
        // 01
      [ADD]: {
        fn: (value1, value2, value3) => {
          this.program[value3] = value1 + value2;
          this.currentPosition += 4;
        },
        opLength: 4,
        lastValueIsIndex: true,
      },

      // 02
      [MUL]: {
        fn: (value1, value2, value3) => {
          this.program[value3] = value1 * value2;
          this.currentPosition += 4;
        },
        opLength: 4,
        lastValueIsIndex: true,
      },

      // 03
      [INP]: {
        fn: async (value1) => {
          let opInput;
          if (this.programInput.length) {
            opInput = +this.programInput[0]; // eslint-disable-line
            this.programInput.shift();
          } else {
            const promptStartTime = new Date();
            await new Promise((resolve) => {
              return this.rl.question('Enter next input:', (input) => {
                resolve(input);
              });
            }).then((input) => {
              opInput = +input;
              const promptEndTime = new Date();
              this.startTime += (promptEndTime - promptStartTime);
            });
          }
          
          this.program[value1] = opInput; 
          this.currentPosition += 2;
        },
        opLength: 2,
        lastValueIsIndex: true,
      },

      // 04
      [OUT]: {
        fn: (value1) => {
          const opcode = String(this.program[this.currentPosition]);
          this.currentPosition += 2;

          if (opcode.charAt(0) === '1') {
            this.output = value1; 
          } else {
            this.output = this.program[value1];
          }
        },
        opLength: 2,
        lastValueIsIndex: true,
      },

      // 05
      [JIT]: {
        fn: (value1, value2) => {
          this.currentPosition = value1 ? value2 : this.currentPosition + 3;
        },
        opLength: 3,
        lastValueIsIndex: false,
      },

      // 06
      [JIF]: {
        fn: (value1, value2) => {
          this.currentPosition = value1 ? this.currentPosition + 3 : value2;
        },
        opLength: 3,
        lastValueIsIndex: false,
      },

      // 07
      [LTH]: {
        fn: (value1, value2, value3) => {
          this.program[value3] = value1 < value2 ? 1 : 0;
          this.currentPosition += 4;
        },
        opLength: 4,
        lastValueIsIndex: true,
      },

      // 08
      [EQU]: {
        fn: (value1, value2, value3) => {
          this.program[value3] = value1 === value2 ? 1 : 0;
          this.currentPosition += 4;
        },
        opLength: 4,
        lastValueIsIndex: true,
      },

      // 09
      [REL]: {
        fn: (value1) => {
          this.relativeBase += value1;
          this.currentPosition += 2;
        },
        opLength: 2,
        lastValueIsIndex: false,
      },
      
      // 99
      [END]: {
        fn: () => {},
        opLength: 1,
        lastValueIsIndex: false,
      },
    }
  }
  
  generateOpValues(params, opCode) {
    const values = [];

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const targetPosition = this.currentPosition + i + 1;

      switch(param) {
        case '2': {
          const paramValue = this.program[targetPosition];
          const relativeAddress = this.relativeBase + paramValue;

          if (relativeAddress >= this.program.length) {
            this.program[relativeAddress] = 0;
          }

          // If this is the output param
          if (i === params.length - 1 && this.opCodes[opCode].lastValueIsIndex) {
            values.push(relativeAddress);
          } else {
            values.push(this.program[relativeAddress]);
          }

          break;
        }

        case '1':
          values.push(this.program[targetPosition]);
          break;
   
        case '0':
        default:
          if (this.program[targetPosition] >= this.program.length) {
            this.program[this.program[targetPosition]] = 0;
          }

          // If this is the output param
          if (i === params.length - 1 && this.opCodes[opCode].lastValueIsIndex) {
            values.push(this.program[targetPosition]);
          } else {
            values.push(this.program[this.program[targetPosition]]);
          }
      }
    }

    return values;
  }

  async processOpCode(rawOpCode) {
    const opCode = String(rawOpCode).padStart(2, '0').substr(-2);
    const { opLength } = this.opCodes[opCode];
    const valueCount = opLength - 1;
    const params = valueCount 
      ? String(rawOpCode).padStart(valueCount + 2, '0')
        .slice(0, -2)
        .split('')
        .reverse()
      : []
    const values = this.generateOpValues(params, opCode)
    
    if (this.pauseOnOp) {
      const pauseStart = new Date();
      await new Promise((resolve) => {
        return this.rl.question('Press Enter', () => {
          resolve();
        });
      })
  
      console.log('rel base', this.relativeBase)
      console.log('pos', this.currentPosition);
      console.log('opcode', opCode, rawOpCode, params)
      console.log('values', valueCount, params, values)
      await fs.writeFile(path.join(__dirname, './program.json'), JSON.stringify({ program: this.program }))
      const pauseEnd = new Date();

      this.startTime += (pauseEnd - pauseStart);
    }

    
    return {
      opCode,
      values,
    };
  }

  async run() {
    while (!this.waiting) {
      const currentTime = new Date();
      if (
        currentTime - this.startTime >= 1000
        && (!this.lastReportedTime || currentTime - this.lastReportedTime >= 1000)
      ) {
        this.lastReportedTime = currentTime;

        if (this.reportTime) {
          console.log(`The process has been running for ${(currentTime - this.startTime) / 1000}s`);
          console.log('Current Position: ', this.currentPosition);
          console.log('OpValue: ', this.program[this.currentPosition]);
        }

        if (currentTime - this.startTime >= this.timeout) {
          throw new Error('Aborting due to timeout')
        }
      }

      const { opCode, values } = await this.processOpCode(this.program[this.currentPosition]);
      if (opCode === END) {
        this.waiting = true;
        this.done = true;
        break;
      }

      await this.opCodes[opCode].fn(...values);
      
      if (opCode === OUT) {
        console.log('pos', this.currentPosition - 2);
        console.log({ output: this.output });
        if (this.waitOnOutput) {
          this.waiting = true;
          break;
        }
      }
    }
  }

  async start() {
    try {
      await this.run();

      return {
        output: this.output,
        done: this.done,
        program: this.program,
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
        output: this.output,
        done: this.done,
      };
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

module.exports = Intcode;
