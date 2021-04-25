const path = require("path"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  config = require("../../etc/config"),
  mergeJson = require("../lib/mergeJson");

module.exports = function copyJsonPlugin(entryJsonFiles, entry) {
  if (!entryJsonFiles) {
    return [];
  }

  const entryJson = Object.entries(entryJsonFiles)
    .filter(([, pathurl]) => {
      if (
        path
          .normalize(pathurl)
          .includes(path.normalize(path.join(config.root, "app.json")))
      ) {
        return true;
      }
      return false;
    })
    .map(([, pathurl]) => {
      return {
        from: pathurl,
        to: config.dist,
        priority: 10,
        transform() {
          const mergedJsonData = mergeJson(Object.values(config.entry));
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
          context: path.join(process.cwd(), config.root),
          from: "**/*.json",
          to: config.dist,
          priority: 5,
          filter(resourcePath) {
            const jsonPathUrl = path.relative(process.cwd(), resourcePath);
            if (
              path
                .normalize(path.join(process.cwd(), config.root, "app.json"))
                .includes(jsonPathUrl)
            ) {
              return false;
            }

            return (
              Object.values(entryJsonFiles).filter((pathUrl) => {
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
