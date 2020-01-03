const myArr = [1, 2, 3];
const myObj = {
  1: 1,
  2: 2,
  3: 3,
}

const mappedArray = myArr.map((item) => item + 1);

const reducedObject = Object.keys(myObj).reduce((accum, key) => {
  return {
    ...accum,
    [key * 2]: key * 2,
  }
}, {});

const sumOfObj = Object.values(myObj).reduce((sum, val) => {
  return sum + val;
}, 0);


(() => {
  console.log(sumOfObj());
})();

