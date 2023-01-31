const {
  findBoth,
  generateItems,
  saveResults,
  createCache,
} = require("./common");

const INTERVAL = 25;
const AMOUNT_OF_RUNS = 15000;

const AMOUNT_OF_ITEMS_PER_RUN = 200;

const AMOUNT_OF_TARGETS = 10;

const runTest = () => {
  const linearData = [];
  const binaryData = [];

  for (let j = 0; j <= AMOUNT_OF_TARGETS; j++) {
    for (let i = 0; i < AMOUNT_OF_ITEMS_PER_RUN; i += INTERVAL) {
      // try with 10 targets for every amount of items
      const items = generateItems(i);

      const target = Math.floor(i * (j / AMOUNT_OF_TARGETS));

      const { timeLinear, timeBinary } = findBoth(items, target);

      const targetCategory = parseFloat((j / AMOUNT_OF_TARGETS).toFixed(1));
      linearData.push({
        itemsCount: i,
        target: targetCategory,
        time: timeLinear,
      });
      binaryData.push({
        itemsCount: i,
        target: targetCategory,
        time: timeBinary,
      });
    }
  }

  return { linearData, binaryData };
};

(async () => {
  const startingTime = new Date();
  console.log("Starting at", startingTime.toLocaleString());

  const [addLinearData, getLinearAverage, deleteLinearData] =
    createCache("linear_any-case");
  const [addBinaryData, getBinaryAverage, deleteBinaryData] =
    createCache("binary_any-case");

  for (let i = 0; i < AMOUNT_OF_RUNS; i++) {
    const { linearData, binaryData } = runTest();

    // save on disk, because I don't want to take up memory.
    // takes longer, but want to have as much memory as possible for testing
    // without running garbage collector
    await Promise.all([addLinearData(linearData), addBinaryData(binaryData)]);

    // not needed because it is run before every test anyways
    // global.gc();

    // don't care that often
    if (i % 50 === 0) {
      const percentageDone = Math.floor((i / AMOUNT_OF_RUNS) * 100);

      const currentTime = new Date();
      const timeElapsed =
        (currentTime.getTime() - startingTime.getTime()) / 1000; // in seconds

      console.log(
        `${i} / ${AMOUNT_OF_RUNS} = ${percentageDone}%. Time elapsed: ${timeElapsed}`
      );
    }
  }

  const averageLinearData = await getLinearAverage();
  const averageBinaryData = await getBinaryAverage();

  const finalData = {
    type: "target_any",
    targetsAmount: AMOUNT_OF_TARGETS,
    linearData: averageLinearData,
    binaryData: averageBinaryData,
  };

  saveResults(
    `target_any.runs_${AMOUNT_OF_RUNS}.interval_${INTERVAL}.items_0-${AMOUNT_OF_ITEMS_PER_RUN}.targets_${AMOUNT_OF_TARGETS}`,
    finalData
  );

  deleteLinearData();
  deleteBinaryData();

  const finishTime = new Date();
  const totalTime = (finishTime.getTime() - startingTime.getTime()) / 1000; // in seconds

  console.log("Started at", startingTime.toLocaleString());
  console.log("Finished at", finishTime.toLocaleString());
  console.log("Time in seconds: ", totalTime);
})();
