module.exports = function getFirstMainFields() {
  const platform = process.env.ZIU_BUILD_PLATFORM;

  if (platform) {
    return [`${platform}Module`, `${platform}Main`];
  }

  return [];
};
