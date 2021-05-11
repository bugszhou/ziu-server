const { join } = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsPlugin = require("@soda/friendly-errors-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");
const MiniProgramRequireWebpackPlugin = require("mini-program-require-webpack-plugin");

const getSplitChunksConfig = require("./config/splitChunksConfig");
const copyJsonPlugin = require("./plugins/copyJsonPlugin");
const miniJsLoader = require("./loaders/miniJsLoader");
const scriptLoader = require("./loaders/scriptLoader");
const styleLoader = require("./loaders/styleLoader");
const xmlLoader = require("./loaders/xmlLoader");

const sourceMapPlugin = require("./plugins/sourceMapPlugin");
const definePlugin = require("./plugins/definePlugin");
const progressPlugin = require("./plugins/progressPlugin");
const copyProjectConfig = require("./plugins/copyProjectConfig");
const setProcessFallback = require("./plugins/processFallback");
const nodePolyfill = require("./plugins/nodePolyfill");

const generateCacheConfig = require("./config/cacheConfig");

module.exports = function build(
  entryData = {
    entry: {},
    jsonFiles: {},
    subPackagesDir: [],
  },
  opts = { clean: false, buildConfig: {} },
) {
  const config = opts.buildConfig;

  let processPolyfill = setProcessFallback();

  if (!config.process) {
    processPolyfill = {
      fallback: {},
      plugins: [],
    };
  }

  return webpack({
    entry: entryData.entry,
    output: {
      path: config.dist,
      clean: opts.clean,
      pathinfo: false,
      globalObject: config.globalObject || "global",
      assetModuleFilename: (file) => {
        return file.filename.replace(/^src\/?/, "/");
      },
    },
    mode: process.env.NODE_ENV,
    devtool: false,
    cache: generateCacheConfig(config.useCache, __filename),
    snapshot: {
      buildDependencies: {
        hash: true,
        timestamp: true,
      },
    },
    target: false,
    module: {
      rules: [
        ...miniJsLoader(config.compiledSuffix.miniJs),
        ...scriptLoader(config.entrySuffix.js),
        ...styleLoader(config.compiledSuffix.css),
        ...xmlLoader(config.entrySuffix.xml),
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.json$/,
          use: {
            loader: "mini-json-loader",
            options: {
              test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [
        ".tsx",
        ".ts",
        ".js",
        ".scss",
        ".less",
        config.compiledSuffix.css,
      ],
      fallback: {
        fs: false,
        cluster: false,
        ...processPolyfill.fallback,
        ...(config.fallback || {}),
      },
    },
    optimization: {
      emitOnErrors: true,
      runtimeChunk: {
        name: `${config.commonsDir}/runtime`,
      },
      splitChunks: getSplitChunksConfig({
        root: config.root,
        compileCssSuffix: config.compiledSuffix.css,
        subPackagesDir: entryData.subPackagesDir,
        commonsDir: config.commonsDir,
      }),
    },
    plugins: [
      new webpack.web.JsonpTemplatePlugin(),
      new MiniProgramRequireWebpackPlugin(),
      ...processPolyfill.plugins,
      ...nodePolyfill(config.polyfill),
      ...(config.plugins || []),
      new MiniCssExtractPlugin({
        filename: `[name].${config.compiledSuffix.css}`,
      }),
      new FriendlyErrorsPlugin({
        onErrors: (severity, errors) => {
          if (severity !== "error") {
            return;
          }
          const error = errors[0];
          console.log(error);
        },
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: true,
        async: true,
      }),
      new ESLintPlugin({
        threads: 2,
        fix: true,
        extensions: ["tsx", "ts", "js"],
      }),
      definePlugin(config.envData),
      ...sourceMapPlugin(config.useSourceMap),
      ...copyJsonPlugin({
        entryJsonFiles: entryData.jsonFiles,
        entry: config.entry,
        root: config.root,
        dist: config.dist,
      }),
      ...copyProjectConfig({
        cwd: join(process.cwd(), config.root),
        output: config.dist,
        id: config.id,
        mode: config.mode,
        projectConfigName: config.projectConfigName,
        projectConfig: config.projectConfig,
      }),
      new StylelintPlugin(),
      progressPlugin(),
    ],
  });
};
