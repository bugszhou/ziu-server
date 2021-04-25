const webpack = require("webpack");

module.exports = function progressPlugin() {
  return new webpack.ProgressPlugin({
    activeModules: false,
    entries: true,
    modules: true,
    modulesCount: 5000,
    profile: false,
    dependencies: true,
    dependenciesCount: 10000,
    percentBy: null,
  });
};
