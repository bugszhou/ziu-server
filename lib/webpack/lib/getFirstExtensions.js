module.exports = function getFirstExtensions() {
  const platform = process.env.ZIU_BUILD_PLATFORM;

  if (platform === "weapp") {
    return [".weapp.ts", ".weapp.js"];
  }

  if (platform === "aliapp") {
    return [".aliapp.ts", ".aliapp.js"];
  }

  if (platform === "swan") {
    return [".swan.ts", ".swan.js"];
  }

  if (platform === "tt") {
    return [".tt.ts", ".tt.js"];
  }

  return [];
};
