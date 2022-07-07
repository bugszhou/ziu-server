#!/usr/bin/env node

const { join, extname } = require("path");

const minimist = require("minimist"),
  argv = minimist(process.argv.slice(2)),
  PRJ_ENV = argv._[0] || "production",
  bundleAnalyzerReport = argv.report || argv.r || false;

const devBuild = require("./bin/dev");

function run() {
  const configPath = argv.config || "";
  /** @type {weapp | aliapp | swan | tt} */
  const platform = argv.platform || "weapp";
  process.env.ZIU_BUILD_PLATFORM = platform;

  if (!configPath) {
    throw new Error(`Not Config File!`);
  }

  if (extname(configPath) !== ".js") {
    throw new Error(`Not Config File!`);
  }
  process.env.PRJ_ENV = PRJ_ENV;

  const config = require(join(process.cwd(), configPath));

  if (!config.envList[PRJ_ENV]) {
    throw new Error(`Not Support ${PRJ_ENV} env!`);
  }

  process.env.NODE_ENV = "production";

  if (PRJ_ENV === "development") {
    process.env.NODE_ENV = PRJ_ENV;
    devBuild(config);
    return;
  }

  if (bundleAnalyzerReport) {
    process.env.bundleAnalyzerReport = bundleAnalyzerReport;
  }

  const build = require("./bin/build");

  build(config);
}

run();
