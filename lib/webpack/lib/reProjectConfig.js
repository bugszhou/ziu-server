const { join } = require("path");
const { existsSync, readFileSync } = require("fs");
const merge = require("lodash.merge");

const defaultOptions = {
  id: "",
  mode: "production",
  projectConfigName: "",
  projectConfig: {},
  outputPath: "",
};

module.exports = function reProjectConfig(
  content = "{}",
  options = defaultOptions,
) {
  const appid = options.id;

  const configData = JSON.stringify(
    merge(JSON.parse(content), appid ? { appid } : ""),
  );

  if (options.mode === "development") {
    return getDevProjectConfig(configData, {
      mode: options.mode,
      projectConfigName: options.projectConfigName,
      outputPath: options.outputPath,
    });
  }

  const allProjectConfig = merge(JSON.parse(configData), options.projectConfig);

  if (allProjectConfig.projectname.includes(options.mode)) {
    return JSON.stringify(allProjectConfig);
  }

  allProjectConfig.projectname = `${options.mode}-${allProjectConfig.projectname.replace(
    "development-",
    "",
  )}`;

  return JSON.stringify(allProjectConfig);
};

const defaultDevOptions = {
  mode: "development",
  projectConfigName: "",
  outputPath: "",
};

function getDevProjectConfig(content = "{}", options = defaultDevOptions) {
  let projectConf = JSON.parse(content);

  if (
    projectConf.projectname &&
    !projectConf.projectname.includes(options.mode)
  ) {
    projectConf.projectname = `${options.mode}-${projectConf.projectname}`;
  }

  const pathUrl = join(options.outputPath, options.projectConfigName);
  /**
   * dist下面是否project config文件，有的话，
   */
  if (existsSync(pathUrl)) {
    try {
      return JSON.stringify(
        merge(projectConf, JSON.parse(readFileSync(pathUrl, "utf-8"))),
      );
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.stringify(projectConf);
}
