const { join } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const merge = require("lodash.merge");

module.exports = function copyProjectConfig(config) {
  const devProjectConfigPath = join(config.dist, config.projectConfigName);
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
};
