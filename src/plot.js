const fs = require("fs");
const path = require("path");
const commandLineArgs = require("command-line-args");
const { plot } = require("nodeplotlib");
const { OUT_DIR } = require("./common");

const optionDefinitions = [{ name: "data-file", alias: "d", type: String }];
const options = commandLineArgs(optionDefinitions);

if (!options["data-file"]) {
  throw new Error(
    `You need to provide a data file like so:
    npm run plot -- -d path/to/file.json`
  );
}

// x: itemsCount
// y: time
const plotData2D = (data) => {
  const plotted = {
    x: [],
    y: [],
    type: "scatter",
  };

  for (const entry of data) {
    plotted.x.push(entry.itemsCount);
    plotted.y.push(entry.time);
  }

  return plotted;
};

// x: target
// y: itemsCount
// z: time
const plotData3D = (data, type, targetInterval) => {
  const targetMap = {};

  for (const entry of data) {
    const targetCategory = entry.target.toString();
    if (!targetMap[targetCategory]) {
      targetMap[targetCategory] = {
        x: [],
        y: [],
        z: [],
        colorscale:
          type === "linear"
            ? [
                ["0", "#005fff"],
                ["1", "#00ff88"],
              ]
            : [
                ["0", "#492e00"],
                ["1", "#ffa200"],
              ],
      };
    }

    targetMap[targetCategory].x.push([entry.target, entry.target + 0.1]);
    targetMap[targetCategory].y.push([entry.itemsCount, entry.itemsCount]);
    targetMap[targetCategory].z.push([entry.time, entry.time]);
  }

  return Object.entries(targetMap).map(([targetCategory, data]) => {
    return {
      ...data,
      name: targetCategory,
      type: "surface",
    };
  });
};

// const data = JSON.parse(
//   fs.readFileSync(path.join(OUT_DIR, "./target-any.json"))
// );

const data = JSON.parse(fs.readFileSync(options["data-file"]));

if (data.type === "target_worst-case") {
  plot(
    [
      {
        ...plotData2D(data.linearData),
        name: "linear",
      },
      {
        ...plotData2D(data.binaryData),
        name: "binary",
      },
    ],
    undefined,
    {}
  );
} else if (data.type === "target_any") {
  const targetInterval = 1 / (data.targetsAmount ?? 1);
  plot([...plotData3D(data.linearData, "linear", targetInterval)]);
  plot([...plotData3D(data.binaryData, "binary", targetInterval)]);
} else {
  throw new Error("Unknown data type");
}
