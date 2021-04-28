const path = require("path"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  mergeJson = require("../lib/mergeJson");

const defaultOptions = {
  entryJsonFiles: [],
  root: "src",
  entry: {},
  dist: path.join(process.cwd(), "dist"),
}

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
          const mergedJsonData = mergeJson(Object.values(options.entry));
          const jsonString = normalizeUsingComponents(
            JSON.stringify(mergedJsonData, null, 2),
            entry,
          );
          return jsonString;
        },
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
        },
        ...entryJson,
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
        if (!entry[pathUrl] || entry[pathUrl].length === 0) {
          tmp[componentName] = pathUrl;
          return;
        }

        tmp[componentName] = entry[pathUrl][0].includes("node_modules")
          ? `/${pathUrl}`
          : pathUrl;
      },
    );
    jsonData.usingComponents = tmp;
    return JSON.stringify(jsonData);
  } catch (e) {
    console.error(e);
    return content;
  }
}
