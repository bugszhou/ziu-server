/**
 * 复制项目配置文件
 */

const ENV = process.env.PRJ_ENV,
  fs = require("fs"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  rePkgConfig = require("../lib/reProjectConfig");

function copyProjectConfig(options) {
  const configFiles = Array.isArray(options.otherConfig)
    ? options.otherConfig
    : [options.otherConfig];
  const pluginOptions = !options.otherConfig
    ? []
    : configFiles
        .filter((item) => fs.existsSync(item.to))
        .map((item) => {
          if (item.to && item.to.includes("project.private.config.json")) {
            return {
              from: `${item.to}`,
              to: options.output,
              transform(content) {
                try {
                  const original = JSON.parse(content.toString());
                  const distJson = JSON.parse(
                    fs.readFileSync(item.from, "utf-8"),
                  );
                  return JSON.stringify(merge(original, distJson));
                } catch (e) {
                  return content;
                }
              },
            };
          }
          return {
            from: `${item.to}`,
            to: options.output,
          };
        });

  return [
    new CopyWebpackPlugin({
      patterns: [
        ...pluginOptions,
        {
          context: options.cwd,
          from: `${options.projectConfigName}`,
          to: options.output,
          transform(content) {
            return rePkgConfig(content.toString(), {
              id: options.id,
              mode: options.mode,
              projectConfigName: options.projectConfigName,
              projectConfig: options.projectConfig,
              outputPath: options.output,
            });
          },
        },
      ],
    }),
  ];
}

module.exports = copyProjectConfig;
