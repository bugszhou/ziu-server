const { join } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const merge = require("lodash.merge");
const cpy = require("cp-file");

module.exports = function copyProjectConfig(config) {
  const devProjectConfigPath = config.projectConfigPath;
  const srcProjectConfigPath = join(
    process.cwd(),
    config.root,
    config.projectConfigName,
  );

  let devProjectConfig = {};
  let srcProjectConfig = {};

  if (existsSync(devProjectConfigPath)) {
    try {
      devProjectConfig = JSON.parse(readFileSync(devProjectConfigPath));
    } catch (e) {
      console.error(e);
    }
  }

  if (existsSync(srcProjectConfigPath)) {
    try {
      srcProjectConfig = JSON.parse(readFileSync(srcProjectConfigPath));
    } catch (e) {
      console.error(e);
    }
  }

  const projectConfig = merge(srcProjectConfig, devProjectConfig);
  writeFileSync(srcProjectConfigPath, JSON.stringify(projectConfig, null, 2));
  copyOtherConfig(config);
};

function copyOtherConfig(config) {
  const configFiles = Array.isArray(config.otherConfig)
    ? config.otherConfig
    : [config.otherConfig || ""];

  configFiles
    .filter((item) => item)
    .forEach((item) => {
      try {
        if (!existsSync(item.from)) {
          return;
        }
        cpy.sync(
          item.from,
          item.to,
        );
      } catch (e) {
        console.error(e);
      }
    });
}
