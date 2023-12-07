const { join } = require("path");
const webpack = require("webpack");
const getData = require("lodash.get");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsPlugin = require("@soda/friendly-errors-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");
const MiniProgramRequireWebpackPlugin = require("mini-program-require-webpack-plugin");
const MiniProgramGlobalRuntimeWebpackPlugin = require("mini-program-global-runtime-webpack-plugin");
const MiniProgramGlobalWebpackPlugin = require("mini-program-global-webpack-plugin");

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
const getFirstExtensions = require("./lib/getFirstExtensions");
const getFirstMainFields = require("./lib/getFirstMainFields");

/** @typedef {import("../../typings").IZiuServerConfig} IConfig */

module.exports = function build(
  entryData = {
    entry: {},
    jsonFiles: {},
    subPackagesDir: [],
  },
  opts = { clean: false, buildConfig: {} },
) {
  /** @type {IConfig} */
  const config = opts.buildConfig;

  let processPolyfill = setProcessFallback();

  if (!config.process) {
    processPolyfill = {
      fallback: {},
      plugins: [],
    };
  }

  const assetsRoot =
    typeof config.assetsRoot === "undefined" ? "/" : String(config.assetsRoot);

  if (assetsRoot && !assetsRoot.endsWith("/")) {
    console.warn(`${assetsRoot} must end of /`);
  }

  return webpack({
    entry: entryData.entry,
    output: {
      path: config.dist,
      clean: opts.clean,
      pathinfo: false,
      globalObject: config.globalObject || "global",
      assetModuleFilename: (file) => {
        return file.filename.replace(/^src\/?/, assetsRoot);
      },
      chunkFormat: "array-push",
      chunkLoadingGlobal: getData(
        config,
        "webpack.outputChunkLoadingGlobal",
        "miniProgramChunk",
      ),
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
        ...miniJsLoader(config.compiledSuffix.miniJs, config.miniJsConfig),
        ...scriptLoader(config.entrySuffix.js, config.script || {}),
        ...styleLoader(config.compiledSuffix.css),
        ...xmlLoader(config.entrySuffix.xml),
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: {
            publicPath: config.assetPublicPath || "",
          },
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
      alias: {
        "@": join(process.cwd(), "src/"),
        ...(config.alias || {}),
        ...getData(config, "webpack.resolveAlias", {}),
      },
      modules: [
        "node_modules",
        ...getData(config, "webpack.resolveModules", []),
      ],
      mainFields: [
        ...(config.mainFields || []),
        ...getFirstMainFields(),
        ...getData(config, "webpack.resolveMainFields", []),
        "module",
        "main",
        "browsers",
      ],
      extensions: [
        ...getFirstExtensions(),
        ".tsx",
        ".ts",
        ".js",
        ".scss",
        ".less",
        getData(config, "compiledSuffix.css", "").indexOf(".") === 0 ? getData(config, "compiledSuffix.css", "") : `.${getData(config, "compiledSuffix.css", "")}`,
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
        splitSize: config.splitSize,
        splitNodeModules: config.splitNodeModules,
      }),
      chunkIds: process.env.NODE_ENV === "development" ? "named" : "total-size",
      ...getData(config, "webpack.optimization", {}),
    },
    plugins: [
      new webpack.web.JsonpTemplatePlugin(),
      new MiniProgramRequireWebpackPlugin(),
      new MiniProgramGlobalRuntimeWebpackPlugin(),
      ...processPolyfill.plugins,
      ...nodePolyfill(config.polyfill),
      new MiniProgramGlobalWebpackPlugin(),
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
        fix: config.eslintFix === false ? false : true,
        extensions: ["tsx", "ts", "js"],
      }),
      definePlugin(config.envData),
      ...sourceMapPlugin(config.useSourceMap),
      ...copyJsonPlugin({
        entryJsonFiles: entryData.jsonFiles,
        entry: config.entry,
        root: config.root,
        dist: config.dist,
        subPackagesName: config.subPackagesName,
      }),
      ...copyProjectConfig({
        cwd: join(process.cwd(), config.root),
        output: config.dist,
        id: config.id,
        mode: config.mode,
        projectConfigName: config.projectConfigName,
        projectConfig: config.projectConfig,
        otherConfig: config.otherConfig,
      }),
      new StylelintPlugin(),
      progressPlugin(),
    ],
  });
};
