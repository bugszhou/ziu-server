const NodePolyfillPlugin = require("node-builtin-polyfill-webpack-plugin");

module.exports = function nodePolyfill(polyfill) {
  if (polyfill && polyfill.node) {
    const nodePolyfillPlugin = new NodePolyfillPlugin({
      exclude: ["process", "console"],
    });

    return [nodePolyfillPlugin, nodePolyfillPlugin.plugin];
  }

  return [];
};
