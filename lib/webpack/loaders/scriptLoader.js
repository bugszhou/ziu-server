module.exports = function scriptLoader(suffix) {
  if (!suffix || String(suffix).includes("js")) {
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
    ];
  }

  return [
    {
      test: /\.js$/,
      use: "babel-loader",
      exclude: /(node_modules)/,
      options: {
        babelrc: true,
      },
    },
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "thread-loader",
          options: {
            workerParallelJobs: 4,
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
