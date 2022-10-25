module.exports = function scriptLoader(suffix, config) {
  let exclude = (config && config.exclude) || [];
  const useBabelInTS = (config && config.useBabelInTS) || false;
  const useLogBeautify = (config && config.useLogBeautify) || false;
  const babelPresetsModules = config && config.babelPresetsModules;

  if (!Array.isArray(exclude)) {
    exclude = [exclude];
  }

  exclude.push(/(node_modules)/);

  const tsBabelConfig = !useBabelInTS
    ? []
    : [
        {
          loader: "babel-loader",
          options: {
            babelrc: true,
            presets: [
              [
                "@babel/preset-env",
                {
                  modules: babelPresetsModules === false ? false : babelPresetsModules ? babelPresetsModules : "commonjs",
                  targets: {
                    esmodules: false,
                  },
                },
              ],
            ],
            plugins: useLogBeautify ? ["log-beautify"] : [],
          },
        },
      ];
  if (!suffix || String(suffix).includes("js")) {
    return [
      {
        test: /\.js$/,
        use: [
          {
            loader: "thread-loader",
            options: {
              workerParallelJobs: 2,
            },
          },
          {
            loader: "babel-loader",
            options: {
              babelrc: true,
              plugins: useLogBeautify ? ["log-beautify"] : [],
            },
          },
        ],
        exclude: exclude,
      },
    ];
  }

  return [
    {
      test: /\.js$/,
      use: [
        {
          loader: "babel-loader",
          options: {
            babelrc: true,
            plugins: useLogBeautify ? ["log-beautify"] : [],
          },
        },
      ],
      exclude: exclude,
    },
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "thread-loader",
          options: {
            workerParallelJobs: 2,
          },
        },
        ...tsBabelConfig,
        {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            happyPackMode: true,
          },
        },
      ],
    },
  ];
};
