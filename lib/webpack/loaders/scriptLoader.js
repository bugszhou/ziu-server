module.exports = function scriptLoader(suffix, config) {
  let exclude = config && config.exclude || [];

  if (!Array.isArray(exclude)) {
    exclude = [exclude];
  }

  exclude.push(/(node_modules)/);
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
