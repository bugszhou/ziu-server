const { join } = require("path");

module.exports = function generateCacheConfig(useCache, configPath) {
  if (!useCache) {
    return false;
  }

  const cacheMaxAge = 7 * 24 * 60 * 60 * 1000;
  return {
    version: "0.0.1",
    type: "filesystem",
    cacheDirectory: join(process.cwd(), "node_modules/.cache/webpackCache"),
    managedPaths: [join(process.cwd(), "node_modules")],
    maxAge: cacheMaxAge,
    ...(configPath
      ? {
          buildDependencies: {
            config: [__filename],
          },
        }
      : {}),
  };
};
