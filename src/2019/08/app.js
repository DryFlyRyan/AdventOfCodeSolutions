const fs = require('fs').promises;
const path = require('path');

const width = 25;
const height = 6;
const area = height * width;

const formatInput = async () => {
  const rawInput = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  const input = rawInput.split('');

  const layers = [];
  while (input.length) {
    layers.push(input.splice(0, area))
  }

  return layers;
}

const numberCounts = (input) => input.map((layer) => {
  const counts = layer.reduce((countMap, pixel) => {
    countMap[pixel]++;
    return countMap;
  }, { 0: 0, 1: 0, 2: 0 });

    return {
      layer,
      counts,
    };
});

const findFewestZeros = (counts) => counts.reduce((lowestCount, item) => {
  if (item.counts['0'] < lowestCount.counts['0']) {
    return item;
  }

  return lowestCount;
}, { counts: { 0: area, 1: 0, 2: 0 } });


const decodeImage = layers => {
  const message = [];
  for (pixel = 0; pixel < area; pixel++) {
    for (layer = 0; layer < layers.length; layer++) {
      if (layers[layer][pixel] < 2) {
        message.push(layers[layer][pixel]);
        break;
      }
    }
  }

  let image = [];

  while (message.length) {
    const messageRow = message.splice(0, width).join('');
    image.push(messageRow)
  }

  return image;
}

(async () => {
  try {
    const input = await formatInput();
    // await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify({ input }))
    // const counts = numberCounts(input);
    // const fewestZeros = findFewestZeros(counts);
    // console.log('Answer: ', fewestZeros.counts['1'] * fewestZeros.counts['2']);

    const image = decodeImage(input);
    await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify({ image }))

  } catch (error) {
    console.log('stop failing silently')
  }
})();
