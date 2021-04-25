const webpack = require("webpack");

module.exports = function definePlugin(envData) {
  return new webpack.DefinePlugin({
    "process.env.ENV_DATA": envData,
  });
};
