const path = require("path");
const merge = require("lodash.merge");
const globby = require("globby");
const jsonfile = require("jsonfile");

function mergeJson(entryPath) {
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
        return;
      }

      content.subpackages = [
        ...content.subpackages,
        ...(jsonData.subpackages || []),
      ];
    }, {});

  return content;
}

module.exports = mergeJson;
