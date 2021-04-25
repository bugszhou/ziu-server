module.exports = {
  envComp: function envComp(env = "production") {
    return process.env.NODE_ENV === env;
  },
  prjEnvComp: function prjEnvComp(env = "production") {
    return process.env.PRJ_ENV === env;
  },
};
