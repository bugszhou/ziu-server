const { ProvidePlugin } = require("webpack");

module.exports = function setProcessFallback() {
  return {
    fallback: {
      process: require.resolve("process/browser"),
    },
    plugins: [
      new ProvidePlugin({
        process: "process/browser",
      }),
    ],
  };
};
