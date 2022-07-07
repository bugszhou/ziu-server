const { join } = require("path");
const gulp = require("gulp");
const getEntry = require("mini-entry");
const del = require("del");
const copyProjectConfig = require("../utils/copyProjectConfig");
const webpackBuild = require("../webpack/webpack.config");

let compiler = null;

function runBuild(config) {
  const { entry, jsonFiles, subPackagesDir } = getEntry({
    platform: process.env.ZIU_BUILD_PLATFORM,
    ...config,
  });

  console.log(entry, jsonFiles, subPackagesDir);

  let gulpWatcher = gulp.watch(Object.values(jsonFiles));

  gulpWatcher.on("all", function () {
    if (compiler && gulpWatcher) {
      gulpWatcher.close();
      gulpWatcher = null;
      compiler.close(() => {
        compiler = null;
        process.nextTick(() => {
          runBuild(config);
        });
      });
    }
  });

  compiler = webpackBuild(
    { entry, jsonFiles, subPackagesDir },
    {
      buildConfig: config,
    },
  );

  compiler.watch(
    {
      aggregateTimeout: 100,
      poll: undefined,
      ignored: Object.values(jsonFiles),
    },
    (err, stats) => {
      if (err) {
        throw err;
      }

      console.log(
        stats.toString({
          all: false,
          timings: false,
          chunks: false, // Makes the build much quieter
          colors: true, // Shows colors in the console
        }),
      );
    },
  );
}

module.exports = function devBuild(config) {
  process.env.PRJ_ENV = process.env.NODE_ENV = "development";

  copyProjectConfig(config);

  del.sync([
    join(config.dist, "**/*"),
    `!${config.dist}`,
    `!${join(config.dist, "app.json")}`,
  ]);

  runBuild(config);

  process.on("SIGINT", () => {
    copyProjectConfig(config);
    process.exit(0);
  });
};
