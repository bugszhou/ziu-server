const path = require("path"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  mergeJson = require("../lib/mergeJson");

const defaultOptions = {
  entryJsonFiles: [],
  root: "src",
  entry: {},
  dist: path.join(process.cwd(), "dist"),
  subPackagesName: "subpackages",
};

module.exports = function copyJsonPlugin(options = defaultOptions) {
  if (!options.entryJsonFiles) {
    return [];
  }

  const entryJson = Object.entries(options.entryJsonFiles)
    .filter(([, pathurl]) => {
      if (
        path
          .normalize(pathurl)
          .includes(path.normalize(path.join(options.root, "app.json")))
      ) {
        return true;
      }
      return false;
    })
    .map(([, pathurl]) => {
      return {
        from: pathurl,
        to: options.dist,
        priority: 10,
        transform() {
          const mergedJsonData = mergeJson(Object.values(options.entry), options);
          return normalizeUsingComponents(
            JSON.stringify(mergedJsonData, null, 2),
            options.entryJsonFiles,
          );
        },
      };
    });

  const entryJsonInNodeModules = Object.entries(options.entryJsonFiles)
    .filter(([, pathurl]) => {
      return /[\\/]node_modules[\\/]/.test(pathurl);
    })
    .map(([page, pathurl]) => {
      return {
        from: pathurl,
        to: path.join(options.dist, `${page}.json`),
      };
    });

  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(process.cwd(), options.root),
          from: "**/*.json",
          to: options.dist,
          priority: 5,
          filter(resourcePath) {
            const jsonPathUrl = path.relative(process.cwd(), resourcePath);
            if (
              path
                .normalize(path.join(process.cwd(), options.root, "app.json"))
                .includes(jsonPathUrl)
            ) {
              return false;
            }

            return (
              Object.values(options.entryJsonFiles).filter((pathUrl) => {
                return pathUrl.includes(jsonPathUrl);
              }).length !== 0
            );
          },
          transform(content) {
            const jsonString = normalizeUsingComponents(
              content,
              options.entryJsonFiles,
            );
            return jsonString;
          },
        },
        ...entryJson,
        ...entryJsonInNodeModules,
      ],
    }),
  ];
};

/**
 * 把node_modules中的组件路径最签名加上 `/`
 * @param {String} content
 * @param {Object} entry
 * @returns
 */
function normalizeUsingComponents(content, entry) {
  try {
    const jsonData = JSON.parse(content.toString());
    if (!jsonData || !jsonData.usingComponents) {
      return content;
    }
    const tmp = {};
    Object.entries(jsonData.usingComponents).forEach(
      ([componentName, pathUrl]) => {
        // 处理微信plugins或者微信官方组件
        let platformPathUrl = null;
        let dependents = [];

        Object.keys(entry || {}).some((item) => {
          if (path.normalize(item) === path.normalize(pathUrl)) {
            platformPathUrl = item;
            dependents = entry[item];
          }
        });

        if (!platformPathUrl || dependents.length === 0) {
          tmp[componentName] = pathUrl;
          return;
        }

        tmp[componentName] = entry[platformPathUrl].includes("node_modules")
          ? `/${pathUrl}`
          : pathUrl;
      },
    );
    jsonData.usingComponents = tmp;
    return JSON.stringify(jsonData, null, 2);
  } catch (e) {
    console.error(e);
    return content;
  }
}
