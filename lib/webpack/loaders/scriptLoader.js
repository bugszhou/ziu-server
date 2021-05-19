module.exports = function scriptLoader(suffix) {
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
        exclude: /(node_modules)/,
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
      exclude: /(node_modules)/,
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
