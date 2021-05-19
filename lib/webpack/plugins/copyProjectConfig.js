/**
 * 复制项目配置文件
 */

 const ENV = process.env.PRJ_ENV,
 CopyWebpackPlugin = require("copy-webpack-plugin"),
 rePkgConfig = require("../lib/reProjectConfig");

function copyProjectConfig(options) {
 const configFiles = Array.isArray(options.otherConfig) ? options.otherConfig : [options.otherConfig];
 const pluginOptions = !options.otherConfig ? [] : configFiles.map((item) => {
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
       }
     ],
   }),
 ];
}

module.exports = copyProjectConfig;
