module.exports = function scriptLoader() {
  return [
    {
      test: /\.js$/,
      use: "babel-loader",
      exclude: /(node_modules)/,
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
