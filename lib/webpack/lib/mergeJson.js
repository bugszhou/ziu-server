const path = require("path");
const merge = require("lodash.merge");
const globby = require("globby");
const jsonfile = require("jsonfile");

function mergeJson(entryPath) {
  const paths = globby.sync(entryPath);

  const content = paths
    .map((pathUrl) => jsonfile.readFileSync(path.join(process.cwd(), pathUrl)))
    .map((jsonData) => {
      if (jsonData.subPackages || jsonData.subpackages) {
        jsonData.subpackages = jsonData.subPackages || jsonData.subpackages;
        delete jsonData.subPackages;
      }
      return jsonData;
    })
    .reduce((preJson, curJson) => {
      const subPackages = merge([], preJson.subpackages || []);
      const mergedJsonData = merge(preJson, curJson);

      if (subPackages.length !== 0) {
        mergedJsonData.subpackages = [
          ...subPackages,
          ...mergedJsonData.subpackages,
        ];
      }
      return mergedJsonData;
    }, {});

  return content;
}

module.exports = mergeJson;
