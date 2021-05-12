const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function styleLoader(cssCompiledSuffix) {
  return [
    {
      test: new RegExp(`.${cssCompiledSuffix}$`, "i"),
      use: [MiniCssExtractPlugin.loader, "css-loader"],
    },
    {
      test: /\.(s[ac]ss)$/i,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "thread-loader",
          options: {
            workerParallelJobs: 2,
          },
        },
        // Translates CSS into CommonJS
        "css-loader",
        // Compiles Sass to CSS
        "sass-loader",
      ],
    },
  ];
};
