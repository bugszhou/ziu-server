const { join } = require("path");

module.exports = function getSplitChunksConfig({
  root = "",
  compileCssSuffix = "",
  configSuffix = "json",
  subPackagesDir = [],
  commonsDir = "commons",
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
      vendor: {
        test(module) {
          return (
            module.resource &&
            /[\\/]node_modules[\\/]/.test(module.resource) &&
            !new RegExp(`\.${compileCssSuffix}$`).test(module.resource)
          );
        },
        name: `${commonsDir}/vendor`,
        chunks: "initial",
        minSize: 0,
        maxSize: 300 * 1000,
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
