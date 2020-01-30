const fs = require('fs').promises;
const path = require('path');
const intcode = require('../_shared/intcode');
const intcodeFormatter = require('../_shared/intcodeInputFormatter');

const navigateRobot = (currentDirection, currentCoords, turn) => {
  const turnDirection = turn * 2 - 1;
  const directionalChange = currentDirection + turnDirection;
  const direction = directionalChange >= 0
    ? String(directionalChange % 4)
    : '3';
  
  const coords = [...currentCoords]

  switch (direction) {
    case '0':
      coords[1]++
      break;
    case '1':
      coords[0]++
      break;
    case '2':
      coords[1]--
      break;
    case '3':
    default:
      coords[0]--
  }

  return {
    nextDirection: parseInt(direction, 10),
    nextCoords: coords,
  }
};

const mapOutput = async (program) => {
  const coordMap = { '0,0': 1 }
  let currentCoords = [0, 0];
  let currentDirection = 0;

  const computer = new intcode({ program, waitOnOutput: true });
  let finished = false;

  while(!finished) {
    const newInput = coordMap[currentCoords.join(',')] || 0;

    let {
      done: firstDone,
      output: color
    } = await computer.resume({ programInput: [newInput] });

    if (firstDone) {
      finished = true;
      break;
    }

    let {
      done: secondDone,
      output: turn
    } = await computer.resume();

    if (secondDone) {
      break;
    }

    coordMap[currentCoords.join(',')] = color;

    const {
      nextCoords,
      nextDirection,
    } = navigateRobot(currentDirection, currentCoords, turn);

    currentCoords = nextCoords;
    currentDirection = nextDirection;
  }

  return coordMap;
};

const normalizeCoordinates = coordMap => {
  const { minX, minY, newCoords } = Object.keys(coordMap).reduce((mins, coords) => {
    const color = coordMap[coords];
    const [x, y] = coords.split(',').map(coord => parseInt(coord, 10));
    
    if (x < mins.minX) {
      mins.minX = x;
    }

    if (y < mins.minY) {
      mins.minY = y;
    }

    mins.newCoords.push({
      x,
      y,
      color,
    })

    return mins;
  }, {
    minX: 0,
    minY: 0,
    newCoords: [],
  });

  const xMod = Math.abs(minX);
  const yMod = Math.abs(minY);

  return newCoords.reduce((data, coords) => {
    const newCoordSet = {
    ...coords,
    x: coords.x + xMod,
    y: coords.y + yMod,
  }

    if (newCoordSet.x > data.xLen) {
      data.xLen = newCoordSet.x;
    }

    if (newCoordSet.y > data.yLen) {
      data.yLen = newCoordSet.y;
    }

    data.coords.push(newCoordSet);

    return data;
  }, { xLen: 0, yLen: 0, coords: [] });
}

const paintShip = async (directions) => {
  const {
    xLen,
    yLen,
    coords,
  } = directions;

  const yArr = new Array(yLen + 1).fill([])
  let shipSide = yArr.map(() => {
    const newArr = new Array(xLen + 1).fill('.');
    return newArr;
  })


  for (let i = 0; i < coords.length; i++) {
    let { x, y, color } = coords[i];
    const paint = color ? 'X' : '.';
    shipSide[y][x] = paint;
  }

  const linedOutput = shipSide.reverse().join('\n').replace(/,/g, '');
  await fs.writeFile(path.join(__dirname, '/blankShip.txt'), linedOutput);
}

// eslint-disable-next-line
;(async () => {
  try {
    const program = await intcodeFormatter(path.join(__dirname, 'input.txt'));
    const coordMap = await mapOutput(program);
    console.log('Visited: ', Object.keys(coordMap).length);
    const normalizedCoords = normalizeCoordinates(coordMap);
    await paintShip(normalizedCoords)
    process.exit(0)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();