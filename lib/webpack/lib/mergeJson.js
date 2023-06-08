const path = require("path");
const globby = require("globby");
const jsonfile = require("jsonfile");

/**
 * 合并入口文件的子包配置
 * @param {Array} entryPath
 * @returns
 */
function mergeJson(entryPath, options) {
  const paths = globby.sync(entryPath);

  let content = null;

  paths
    .map((pathUrl) => {
      return jsonfile.readFileSync(path.join(process.cwd(), pathUrl));
    })
    .map((jsonData) => {
      if (jsonData.subPackages || jsonData.subpackages) {
        jsonData.subpackages = jsonData.subPackages || jsonData.subpackages;
        delete jsonData.subPackages;
      }
      return jsonData;
    })
    .forEach((jsonData) => {
      if (!content) {
        content = jsonData;
        content.subpackages = Array.isArray(content.subpackages)
          ? content.subpackages
          : [];

        if (options && options.subPackagesName) {
          content[options.subPackagesName] = content.subpackages;
          delete content.subpackages;
        }
        return;
      }

      content.subpackages = [
        ...(content.subpackages || content[options.subPackagesName] || []),
        ...(jsonData.subpackages || []),
      ];

      if (options && options.subPackagesName) {
        content[options.subPackagesName] = content.subpackages;
        delete content.subpackages;
      }
    }, {});

  return content;
}

module.exports = mergeJson;
