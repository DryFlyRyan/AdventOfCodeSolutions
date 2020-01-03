const fs = require('fs').promises;
const oldFs = require('fs');

const formatInput = async () => {
  const rawInput = await fs.readFile('inputs/4.txt', 'utf-8')
    .then((res) => res.split('\n').sort());

  return rawInput.map((input) => {
    const [rawTimeStamp, message] = input.split(/(?<=])\s/g);
    const timestamp = rawTimeStamp.replace(/\[|\]/g, '');
    const minute = parseInt(timestamp.substring(timestamp.length - 2), 10);

    return {
      message,
      minute,
      timestamp,
    };
  });
};

const createTimeBlocks = (rawData) => rawData.reduce((blocks, entry) => {
  if (entry.message.search('Guard') >= 0) {
    const guardId = entry.message.split(' ')[1].substring(1);
    return [
      ...blocks,
      [
        {
          ...entry,
          guardId,
        },
      ],
    ];
  }

  blocks[blocks.length - 1].push(entry);
  return blocks;
}, []).filter((block) => block.length > 1);

const createTimeMap = (timeBlocks) => timeBlocks.reduce((timeMap, blockGroup) => {
  const { guardId } = blockGroup[0];
  const workingTimeMap = timeMap[guardId] ? [...timeMap[guardId]] : new Array(60).fill(0);

  for (let asleepEntry = 1; asleepEntry < blockGroup.length; asleepEntry += 2) {
    const originalTimeMap = [...workingTimeMap];
    const startMinute = blockGroup[asleepEntry].minute;
    const endMinute = blockGroup[asleepEntry + 1].minute;

    for (let minute = startMinute; minute < endMinute; minute++) {
      workingTimeMap[minute]++;
    }

    if (guardId === '2441') {
      const entry = {
        asleepEntry: blockGroup[asleepEntry],
        awakeEntry: blockGroup[asleepEntry + 1],
        originalTimeMap,
        currentTimeMap: workingTimeMap,
      };

      oldFs.appendFileSync('04_test_data.json', `${JSON.stringify(entry)},`);
    }
  }

  return {
    ...timeMap,
    [guardId]: workingTimeMap,
  };
}, {});

const generateSleepData = (timeMap) => Object.keys(timeMap).reduce((sleepDataCollection, guardId) => {
  const sleepData = timeMap[guardId].reduce((timeData, count, index) => {
    if (typeof (count) !== 'number') {
      return timeData;
    }

    return {
      sum: timeData.sum + count,
      max: timeData.max < count ? count : timeData.max,
      maxMinute: timeData.max < count ? index : timeData.maxMinute,
    };
  },
  {
    sum: 0,
    max: 0,
    maxMinute: 0,
  });

  return {
    ...sleepDataCollection,
    [guardId]: {
      ...sleepData,
      timeMatrix: timeMap[guardId],
    },
  };
}, {});

const findSleepiestGuard = (sleepData) => Object.keys(sleepData).reduce((sleepiestGuard, guardId) => {
  if (sleepData[guardId].sum > sleepiestGuard.sum) {
    return {
      ...sleepData[guardId],
      guardId,
    };
  }

  return sleepiestGuard;
}, { sum: 0 });

const findMaxMinute = (sleepData) => Object.keys(sleepData).reduce((sleepiestGuard, guardId) => {
  const guard = sleepData[guardId];
  if (sleepiestGuard.max < guard.max) {
    return { ...guard, guardId };
  }
  return sleepiestGuard;
}, { max: 0 });

(async () => {
  try {
    const rawInput = await formatInput();
    await fs.writeFile('04_raw_output.json', JSON.stringify(rawInput));

    const timeBlocks = await createTimeBlocks(rawInput);
    await fs.writeFile('04_time_blocks.json', JSON.stringify(timeBlocks));

    await fs.writeFile('04_test_data.json', '{ "data": [');
    const timeMap = createTimeMap(timeBlocks);
    await fs.appendFile('04_test_data.json', ']}');
    await fs.writeFile('04_timemap.json', JSON.stringify(timeMap));
    const sleepData = generateSleepData(timeMap);
    await fs.writeFile('04_sleepData.json', JSON.stringify(sleepData));
    const sleepiestGuard = findSleepiestGuard(sleepData);
    console.log(sleepiestGuard.maxMinute * parseInt(sleepiestGuard.guardId, 10));
    const mostAsleepGuard = findMaxMinute(sleepData);
    console.log(mostAsleepGuard.maxMinute * parseInt(mostAsleepGuard.guardId, 10));
  } catch (err) {
    console.error(err);
  }
})();
