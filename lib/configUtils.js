const fs = require("fs");
const path = require("path");

const suffixConfig = {
  weapp: {
    global: "global",
    entrySuffix: {
      js: "ts",
      miniJs: "wxs",
      xml: "wxml",
      css: "scss",
    },
    compiledSuffix: {
      js: "js",
      css: "wxss",
      miniJs: "wxs",
      xml: "wxml",
    },
  },
  aliapp: {
    global: "my",
    entrySuffix: {
      js: "ts",
      css: "scss",
      miniJs: "sjs",
      xml: "axml",
    },
    compiledSuffix: {
      js: "js",
      css: "acss",
      miniJs: "sjs",
      xml: "axml",
    },
  },
};

function getSuffixConfig() {
  return suffixConfig[process.env.ZIU_BUILD_PLATFORM];
}

function getEntry() {
  const platform = process.env.ZIU_BUILD_PLATFORM;
  const hasPlatformApp = fs.existsSync(path.join(process.cwd(), `src/app.${platform}.json`));
  const hasPlatformOutside = fs.existsSync(path.join(process.cwd(), `src/outside/**/*/app.${platform}.json`));
  return {
    app: hasPlatformApp ? `src/app.${platform}.json` : `src/app.json`, // 该行固定格式
    outside:  hasPlatformOutside ? `src/outside/**/*/app.${platform}.json` : `src/outside/**/*/app.json`,
  };
}

module.exports = {
  getSuffixConfig,
  getEntry,
};
