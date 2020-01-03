/* eslint-disable no-param-reassign, no-await-in-loop */

const fs = require('fs').promises;
const path = require('path');

const formatInput = async () => {
  const input = await fs.readFile(path.join(__dirname, './input.txt'), 'utf-8');
  const splitInput = input.split('\n').map((item) => {
    return item.split(')');
  });

  const comNode = splitInput
    .filter((item) => item[0] === 'COM')
    .reduce((comObj, orbit) => {
      const [com, childKey] = orbit;
      return {
        ...comObj,
        childKeys: [
          ...comObj.childKeys,
          childKey,
        ],
      };
    }, {
      id: 'COM', parentId: null, childKeys: [], children: {},
    });

  return splitInput.reduce((mapStuff, orbit) => {
    const [parent, child] = orbit;
    return [
      ...mapStuff,
      {
        id: child,
        parentId: parent,
        children: {},
      },
    ];
  }, [comNode]);
};

const findChildren = (list, parentId) => list
  .reduce((childList, orbit) => {
    if (orbit.parentId !== parentId) {
      return childList;
    }

    return {
      ...childList,
      [orbit.id]: orbit,
    };
  }, {});

const buildNodes = (list, tree, addressArray = [], visitedMap = {}, orbitCountMap = {}) => {
  const address = addressArray.reduce((treeAddress, layerId) => treeAddress.children[layerId], tree);
  const layerId = addressArray.length ? addressArray[addressArray.length - 1] : 'COM';

  orbitCountMap[layerId] = addressArray.slice();

  const navigateUp = () => {
    addressArray.pop();
    visitedMap[layerId] = true;
    return {
      tree,
      addressArray,
      visitedMap,
      orbitCountMap,
    };
  };

  const navigateDown = (childId) => {
    addressArray.push(childId);
    return {
      tree,
      addressArray,
      visitedMap,
      orbitCountMap,
    };
  };

  if (!Object.keys(address.children).length) {
    const foundChildren = findChildren(list, layerId);

    if (!Object.keys(foundChildren).length) {
      return navigateUp();
    }

    address.children = foundChildren;
  }

  const childKeys = Object.keys(address.children);

  for (let i = 0; i < childKeys.length; i++) {
    const childId = address.children[childKeys[i]].id;
    if (!visitedMap[childId]) {
      return navigateDown(childId);
    }
  }

  if (addressArray.length) {
    return navigateUp();
  }

  return {
    done: true,
    tree,
    addressArray,
    visitedMap,
    orbitCountMap,
  };
};

const convertListToTree = async (list) => {
  try {
    const listCopy = list.slice();
    const [root] = listCopy.splice(0, 1);
    let results = buildNodes(listCopy, root);

    while (!results.done) {
      results = buildNodes(listCopy, results.tree, results.addressArray, results.visitedMap, results.orbitCountMap);
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

const testCount = (list, count) => list.filter((listItem) => !count[listItem.id]);

const sumOrbits = (orbitCounts) => Object.keys(orbitCounts).reduce((sum, key) => sum + orbitCounts[key], 0);

const findCommonPoints = async (orbitCounts) => {
  const {
    SAN,
    YOU,
  } = orbitCounts;

  SAN.pop();
  YOU.pop();

  const combinedArr = [...SAN, ...YOU];

  const dups = [];

  for (let i = 0; i < combinedArr.length; i++) {
    const planet = combinedArr[i];
    const indexOfNext = combinedArr.indexOf(planet, i + 1);

    if (indexOfNext > 0) {
      dups.push(planet);
    }
  }

  const lastPoint = dups[dups.length - 1];

  const sanDist = (SAN.length - 1) - SAN.indexOf(lastPoint);
  const youDist = (YOU.length - 1) - YOU.indexOf(lastPoint);

  const sanPath = SAN.slice(SAN.indexOf(lastPoint));
  const youPath = YOU.slice(YOU.indexOf(lastPoint));

  await fs.writeFile(path.join(__dirname, 'paths.json'), JSON.stringify({ sanPath, youPath })); 

  console.log(sanPath.length + youPath.length);

  console.log(sanDist, SAN.indexOf(lastPoint), SAN.length, SAN[SAN.length - 1])

  return sanDist + youDist - 1;
};

(async () => {
  try {
    const input = await formatInput();
    const tree = await convertListToTree(input);
    await fs.writeFile(path.join(__dirname, 'tree.json'), JSON.stringify({ tree }));

    const dups = await findCommonPoints(tree.orbitCountMap);
    console.log(dups);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
