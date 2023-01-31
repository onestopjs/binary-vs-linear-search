# When is binary search worth it?

This is the code from my article [When is binary search worth it?](https://onestopjs.dev/articles/when-is-binary-search-worth-it/).

## Install

The code is written for NodeJS. You need NodeJS and npm in order to install.

1. Clone this repository
2. `npm install`

## Provided data

If you don't want to waste your time running meaningless experiments, but want to visualize my data, I have provided it in the `data` folder.

I have provided 3 npm scripts to make visualizing easier.

`npm run plot:main`\
Plots the main gist of the article - worst case scenario for both linear and binary search, with items 0 through 600.

`npm run plot:main:no_opt`
Same as above, but with compiler optimizations disabled, and less items.

`npm run plot:multiple-targets`
Same, but with multiple targets. Visualized with a Ribbon plot.

## Running

There are two types of "experiments" - comparing worst cases, or comparing multiple cases. The files for those are [target_worst-case.js](./src/target_worst-case.js) and [target_any.js](./src/target_any.js) respectively.

Before running any experiments, open either file and change the constants on top of the file - interval, amount of items, amount of runs (for averaging).

Running either will output your results at `results/[fileName]`, with the `fileName` depending on your config. Those are the raw results. You can manipulate them in any meaningful way you desire in order to display them, or just use my methods.

### Worst case

`npm run target:worst-case`

### Any case

This is meant more for fun than anything else, but you can still run it for yourself.

`npm run target:any`

## Displaying results

After you have generated your results, you can visualize them with the script I have provided:

`npm run plot -- -d path/to/file.json`

e.g. `npm run plot -- -d results/target_any.runs_15000.interval_25.items_0-15000.targets_10.json`

It's a long one, but just copy the filename.
