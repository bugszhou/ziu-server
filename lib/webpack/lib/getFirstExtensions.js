module.exports = function getFirstExtensions() {
  const platform = process.env.ZIU_BUILD_PLATFORM;

  if (platform === "weapp") {
    return [".weapp.ts"];
  }

  if (platform === "aliapp") {
    return [".aliapp.ts"];
  }

  if (platform === "swan") {
    return [".swan.ts"];
  }

  if (platform === "tt") {
    return [".tt.ts"];
  }

  return [];
};
