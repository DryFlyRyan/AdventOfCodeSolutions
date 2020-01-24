const fs = require('fs').promises;
const path = require('path');

const formatInput = async () => {
  const rawInput = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  const formatRoids = rawInput.split('\n').map((line, yIndex) => {
    const lineArray = line.split('');
    return lineArray.map((lineItem, xIndex) => {
      if (lineItem !== '.') {
        return {
          x: xIndex,
          y: yIndex,
          locatedRoids: [],
          roidSum: 0,
        }
      }
    })
  })

  return formatRoids.reduce((roids, line) => {
    const filteredLine = line.filter(Boolean);
    return [...roids, ...filteredLine];
  }, [])
};

const getSlopes = (roids) => roids.map((roid) => {
  const slopeLines = roids.map((testRoid) => {
    if (roid.x === testRoid.x && roid.y === testRoid.y) {
      return undefined;
    }

    const deltaY = testRoid.y - roid.y;
    const deltaX = testRoid.x - roid.x;
    let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 90;

    angle = angle < 0 ? angle + 360 : angle;

    return {
      x: testRoid.x,
      y: testRoid.y,
      angle,
      dist: Math.abs(deltaX) + Math.abs(deltaY),
    }
  }).filter(Boolean);

  const categorizedRoids = slopeLines.reduce((roidList, roid) => {
    if (!roidList[roid.angle]) {
      roidList[roid.angle] = [roid]
      return roidList;
    }

    roidList[roid.angle].push(roid);
    return roidList;
  }, {})

  const sortedRoids = Object.values(categorizedRoids).map((roidLine) => {
    return roidLine.sort((a, b) => a.dist - b.dist);
  }).sort((a, b) => a[0].angle - b[0].angle)


  return {
    ...roid,
    locatedRoids: sortedRoids,
    roidSum: [...new Set(slopeLines.filter(item => item !== undefined).map((roid) => roid.angle))].length,
  }
})

const destroyRoids = async (roidBase) => {
  let roids = roidBase.locatedRoids;
  let shots = [];

  while (roids.length) {
    const { shots: newShots, roids: newRoids } = roids.reduce((res, roidList, i) => {
      const shotRoid = res.roids[i].splice(0, 1);
      res.shots.push(shotRoid[0]);
      return res;
    }, { shots, roids })

    const filteredRoids = newRoids.filter(roidList => roidList.length);

    shots = newShots;
    roids = filteredRoids;
  }
  
  await fs.writeFile(
    path.join(__dirname, './destroyed_roids.json'),
    JSON.stringify({ x: roidBase.x, y: roidBase.y, roids: shots }));

  
  return shots[199];
}

const getMaxRoids = roids => roids.reduce((maxRoid, roid) => {
  if (roid.roidSum > maxRoid.roidSum) {
    return roid;
  }

  return maxRoid;
}, { roidSum: 0 });

/* RUNNER */
// eslint-disable-next-line
;(async () => {
  const input = await formatInput();
  const slopedRoids = getSlopes(input);
  const roidBase = getMaxRoids(slopedRoids);
  await fs.writeFile(path.join(__dirname, './output.json'), JSON.stringify({ output: roidBase }));
  const winner = await destroyRoids(roidBase);
  console.log('winner', winner)
  console.log('winner coords', winner.x, winner.y);
  console.log('winner', winner.x * 100 + winner.y);
})()