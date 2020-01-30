const fs = require('fs').promises;
const path = require('path');

/* HELPERS */
const calculateSystemEnergy = results => results.reduce((energySum, moon) => {
  energySum.posE += moon.posE;
  energySum.velE += moon.velE;
  energySum.systemEnergy += moon.totalEnergy;

  return energySum;
}, { posE: 0, velE: 0, systemEnergy: 0})

const getVelocity = (a, b) => {
  if (a > b) {
    return -1;
  }

  if (a < b) {
    return 1;
  }

  return 0;
}

const calculateHorizontalTotals = (pos, vel) => {
  let posE = 0;
  let velE = 0;

  for (let i = 0; i < pos.length; i++) {
    posE += Math.abs(pos[i]);
    velE += Math.abs(vel[i]);
  }

  return {
    posE,
    velE,
    totalEnergy: posE * velE,
  };
}

const calculateVerticalTotals = results => results.reduce((vertTots, moon) => {
  return [...moon.pos, ...moon.vel].map((num, i) => Math.abs(num) + vertTots[i]);
}, new Array(6).fill(0)); 


/* RUNNERS/HOF */
const formatInput = async () => {
  const rawInput = await fs.readFile(path.join(__dirname, 'input.txt'), 'utf-8');
  const positions = rawInput
    .split('\n')
    .map((line) => {
      const [x, y, z] = line
        .replace(/[xyz<>=\s]/g, '')
        .split(',')
        .map(num => parseInt(num, 10));
      
      return {
        pos: [x, y, z],
        vel: [0, 0, 0],
        posE: Math.abs(x) + Math.abs(y) + Math.abs(z),
        velE: 0,
      }
    })

  
  return {
    positions,
    ...calculateSystemEnergy(positions),
    verticalTotals: calculateVerticalTotals(positions)
  }
}

const calculateNextPosition = positions => positions.map(moon => {
  const vel = moon.pos.map((posCoord, i) => {
    return positions.reduce((coordVel, testMoon) => {
      return coordVel + getVelocity(posCoord, testMoon.pos[i]);
    }, moon.vel[i]);
  })

  const pos = moon.pos.map((posCoord, i) => {
    return posCoord + vel[i];
  })

  const energy = calculateHorizontalTotals(pos, vel);

  return {
    ...energy, 
    pos,
    vel,
  }
});

const runner = ({ initialPositions = [], iterations = 1 } = {}) => {
  const positions = [initialPositions];
  let i = 0;

  while(i < iterations) {
    const currentPosition = positions[positions.length - 1].positions;
    const nextPos = calculateNextPosition(currentPosition);
    const energy = calculateSystemEnergy(nextPos);
    const verticalTotals = calculateVerticalTotals(nextPos);

    const step = {
      positions: nextPos,
      ...energy,
      verticalTotals,
      iteration: i + 1,
    };

    positions.push(step);
    i++;
  }
  return positions;
};

const compareSlice = (origSlice, testSlice, posInd) => {
  for (let i = 0; i < testSlice.positions.length; i++) {
    if (origSlice.positions[i].pos[posInd] !== testSlice.positions[i].pos[posInd]) {
      return false;
    }
  }

  return true;
}

const getIntervals = results => {
  const testCase = results[0];

  const unfound = {
    x: true,
    y: true,
    z: true,
  }
  let count = 1;

  const intervals = [];

  while((Object.values(unfound).find(Boolean)) && count < results.length) {

    Object.keys(unfound).forEach((dir, i) => {
      if (unfound[dir] && compareSlice(testCase, results[count], i)) {
        intervals.push(count);
        unfound[dir] = false;
      }
    })

    count++;
  }

  return intervals;
}

const lcm_two_numbers = (x, y) => {
  if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
};

const gcd_two_numbers = (x, y) => {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

const getMasterMultiple = intervals => intervals
  .reduce((mult, num) => lcm_two_numbers(mult, num + 1), intervals[0] + 1)

// eslint-disable-next-line
;(async () => {
  try {
    const initialPositions = await formatInput();
    const results = runner({ initialPositions, iterations: 500000 });
    
    await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify({ results }));
    // printResults(results);

    const intervals = getIntervals(results);
    console.log(intervals)
    const masterInterval = getMasterMultiple(intervals);
    console.log(masterInterval)
    // process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})()
