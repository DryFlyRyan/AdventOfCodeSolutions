const fs = require('fs').promises;
const path = require('path');

const formatInputs = async () => {
  const input = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  return input.split('\n').map((wire) => {
    return wire.split(',').map((instruction) => [instruction.charAt(0), +instruction.substr(1)]);
  });
};

const createLines = (wire) => wire.reduce((coords, instr) => {
  const [dir, len] = instr;
  const { x, y } = coords[coords.length - 1][1];

  let nextCoord;
  switch (dir) {
    case 'U':
      nextCoord = {
        x: x - len,
        y,
      };
      break;

    case 'D':
      nextCoord = {
        x: x + len,
        y,
      };
      break;

    case 'L':
      nextCoord = {
        x,
        y: y - len,
      };
      break;

    case 'R':
    default:
      nextCoord = {
        x,
        y: y + len,
      };
  }

  return [
    ...coords,
    [
      { x, y },
      nextCoord,
    ],
  ];
}, [[{ x: 0, y: 0 }, { x: 0, y: 0 }]]).splice(1);

const doesShareArea = (a, b) => (
  a[0].x <= b[1].x
  && a[1].x >= b[0].x
  && a[0].y <= b[1].y
  && a[1].y >= b[0].y
);

const isVertical = (line) => {
  const [start, end] = line;
  const { x: sx, y: sy } = start;
  const { x: ex, y: ey } = end;

  if (sx === ex && sy === ey) {
    throw new Error('Not a line!');
  }

  // All lines are up/down OR left/right
  return sx === ex;
};

const getPerpendicularIntersection = (a, b) => {
  let vert = a;
  let hor = b;

  if (b[0].x === b[1].x) {
    vert = b;
    hor = a;
  }

  return {
    x: vert[0].x,
    y: hor[0].y,
    dist: Math.abs(vert[0].x) + Math.abs(hor[0].y),
  };
};

const findIntersection = (a, b) => {
  if (!doesShareArea(a, b)) {
    return;
  }

  if (isVertical(a) === isVertical(b)) {
    throw new Error('This is a case');
  }

  return getPerpendicularIntersection(a, b);
};

const getSteps = (line) => {
  if (isVertical(line)) {
    return Math.max(line[0].y, line[1].y) - Math.min(line[0].y, line[1].y);
  }

  return Math.max(line[0].x, line[1].x) - Math.min(line[0].x, line[1].x);
};

const getLastStep = (line, inters) => {
  if (isVertical(line)) {
    return Math.max(line[0].y, inters.y) - Math.min(line[0].y, inters.y);
  }

  return Math.max(line[0].x, inters.x) - Math.min(line[0].x, inters.x);
}

const findStepSum = (line, index, inters) => {
  let stepSum = 0;
  for (let i = 0; i <= index; i++) {
    if (i === index) {
      stepSum += getLastStep(line[i], inters);
      return stepSum;
    }

    stepSum += getSteps(line[i]);
  }
};

const testLines = (lineA, lineB) => lineA.reduce((interMap, partA, aIndex) => {
  const innerInters = lineB.map((partB, bIndex) => {
    const partACopy = partA.slice().sort((a, b) => a.x - b.x);
    const partBCopy = partB.slice().sort((a, b) => a.x - b.x);
    const inters = findIntersection(partACopy, partBCopy);

    if (!inters) {
      return;
    }

    return {
      ...inters,
      stepTotal: findStepSum(lineA, aIndex, inters) + findStepSum(lineB, bIndex, inters),
    };
  })
    .filter(Boolean);

  return [
    ...interMap,
    ...innerInters,
  ];
}, []).sort((a, b) => a.stepTotal - b.stepTotal);

(async () => {
  const wires = await formatInputs();
  const [lineA, lineB] = wires.map((wire) => createLines(wire));

  const inters = testLines(lineA, lineB);

  await fs.writeFile(path.join(__dirname, 'inters.json'), JSON.stringify({ inters }));
})();
