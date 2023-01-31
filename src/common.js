const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const linearSearch = (items, target) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) {
      return i;
    }
  }

  return -1;
};
// %NeverOptimizeFunction(linearSearch);

const binarySearch = (items, target) => {
  let start = 0;
  let end = items.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    if (items[mid] === target) {
      return mid;
    }

    if (target < items[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return -1;
};
// %NeverOptimizeFunction(binarySearch);

const ultimateSearch = (items, target) => {
  if (items.length > 100) {
    return binarySearch(items, target);
  }

  return linearSearch(items, target);
};

const findBoth = (items, target) => {
  global.gc();

  const startTimeLinear = performance.now();
  const resultLinear = linearSearch(items, target);
  const endTimeLinear = performance.now();

  global.gc();

  const startTimeBinary = performance.now();
  const resultBinary = binarySearch(items, target);
  const endTimeBinary = performance.now();

  const timeLinear = endTimeLinear - startTimeLinear;
  const timeBinary = endTimeBinary - startTimeBinary;

  return { timeLinear, timeBinary };
};

const calculateAverage = (testsData, amountOfRuns) => {
  const averagedData = [];

  // sum all the times
  for (const testData of testsData) {
    for (let i = 0; i < testData.length; i++) {
      const { time, ...rest } = testData[i];
      if (!averagedData[i]) {
        averagedData[i] = { time, ...rest };
      } else {
        averagedData[i] = {
          time: averagedData[i].time + time,
          ...rest,
        };
      }
    }
  }

  // divide the time by the amount of runs to actually get the average
  for (const entry of averagedData) {
    entry.time = entry.time / amountOfRuns;
  }

  return averagedData;
};

// generate just the missing items to save some work
let items = [];
const generateItems = (length) => {
  if (items.length >= length) {
    items = [];
  }

  const lastElement = items.length - 1;

  for (let i = lastElement; i < length; i++) {
    items.push(i);
  }

  return items;
};

const OUT_DIR = path.join(__dirname, "../results");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

const saveResults = (fileName, data) => {
  // sync doesn't matter here
  fs.writeFileSync(
    path.join(OUT_DIR, `./${fileName}.json`),
    JSON.stringify(data)
  );
};

const createCache = (fileName) => {
  const filePath = path.join(OUT_DIR, `./${fileName}`);
  const writeStream = fs.createWriteStream(filePath);

  let entries = 0;
  const addData = async (data) => {
    const bufferHasSpace = writeStream.write(JSON.stringify(data) + "\n");
    entries++;

    if (!bufferHasSpace) {
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }
  };

  const getAveragedData = async () => {
    writeStream.close();

    const readStream = fs.createReadStream(filePath);

    const lineStream = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    const averagedData = [];
    for await (const rawData of lineStream) {
      const testData = JSON.parse(rawData);

      // sum all the times
      for (let i = 0; i < testData.length; i++) {
        const { time, ...rest } = testData[i];
        if (!averagedData[i]) {
          averagedData[i] = { time, ...rest };
        } else {
          averagedData[i] = {
            time: averagedData[i].time + time,
            ...rest,
          };
        }
      }
    }

    // divide the time by the amount of runs to actually get the average
    for (const entry of averagedData) {
      entry.time = entry.time / entries;
    }

    return averagedData;
  };

  const deleteCache = () => {
    fs.unlinkSync(filePath);
  };

  return [addData, getAveragedData, deleteCache];
};

module.exports = {
  findBoth,
  calculateAverage,
  generateItems,
  saveResults,
  OUT_DIR,

  createCache,
};
