const { join } = require("path");

module.exports = function generateCacheConfig(useCache, configPath) {
  if (!useCache) {
    return false;
  }
  return {
    version: "0.0.1",
    type: "filesystem",
    cacheDirectory: join(process.cwd(), "node_modules/.cache/webpackCache"),
    managedPaths: [join(process.cwd(), "node_modules")],
    ...(configPath
      ? {
          buildDependencies: {
            config: [__filename],
          },
        }
      : {}),
  };
};
