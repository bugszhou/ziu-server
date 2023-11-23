const { join } = require("path");

module.exports = function getSplitChunksConfig({
  root = "",
  compileCssSuffix = "",
  configSuffix = "json",
  subPackagesDir = [],
  splitNodeModules = false,
  commonsDir = "commons",
  splitSize = 300 * 1000,
}) {
  return {
    cacheGroups: {
      // style: {
      //   test: new RegExp(`\.${compileCssSuffix}$`),
      //   name: `${commonsDir}/style`,
      //   chunks: "all",
      //   minSize: 0,
      //   maxSize: 300 * 1000,
      //   minChunks: 2,
      // },
      commonAppJson: {
        test(module) {
          return (
            module.resource &&
            /\.json$/.test(module.resource) &&
            module.resource.indexOf(join(process.cwd(), root)) === 0
          );
        },
        name: function (module) {
          const moduleName = module.identifier();
          const result = subPackagesDir.filter((sub) => {
            if (moduleName.includes(join(root, sub))) {
              return true;
            }
            return false;
          });
          if (result.length && result[0]) {
            return `${result[0]}/${commonsDir}/commonJson`;
          }
          return `${commonsDir}/commonJson`;
        },
        chunks: "initial",
        minSize: 0,
        maxSize: splitSize === null ? 30000 * 1000 : typeof splitSize === "number" ? splitSize : 300 * 1000,
        minChunks: 1,
      },
      vendor: {
        test(module) {
          return (
            module.resource &&
            /[\\/]node_modules[\\/]/.test(module.resource) &&
            !new RegExp(`\.${compileCssSuffix}$`).test(module.resource)
          );
        },
        name: function (module, chunks) {
          if (!splitNodeModules) {
            return `${commonsDir}/vendor`;
          }

          const result = subPackagesDir.filter((sub) => {
            const isSubModule = chunks.every((item) => {
              const index = item.name.indexOf(sub);
              return index === 0;
            });
            if (isSubModule) {
              return true;
            }
            return false;
          });
          if (result.length && result[0]) {
            return `${result[0]}/${commonsDir}/vendor`;
          }
          return `${commonsDir}/vendor`;
        },
        chunks: "initial",
        minSize: 0,
        maxSize:
          splitSize === null
            ? 30000 * 1000
            : typeof splitSize === "number"
            ? splitSize
            : 300 * 1000,
        minChunks: 1,
      },
      commons: {
        test(module) {
          return (
            module.resource &&
            /\.(js|ts)$/.test(module.resource) &&
            module.resource.indexOf(join(process.cwd(), root)) === 0
          );
        },
        name: function (module) {
          const moduleName = module.identifier();
          const result = subPackagesDir.filter((sub) => {
            if (moduleName.includes(join(root, sub))) {
              return true;
            }
            return false;
          });
          if (result.length && result[0]) {
            return `${result[0]}/${commonsDir}/commons`;
          }
          return `${commonsDir}/commons`;
        },
        chunks: "all",
        minSize: 0,
        maxSize: 300 * 1000,
        minChunks: 2,
      },
    },
  };
};
