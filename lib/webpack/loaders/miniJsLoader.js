const { envComp } = require('../../utils');

module.exports = function miniJsLoader(suffix, miniJsConfig) {
  const reg = new RegExp(`\\.${suffix}$`),
    undefinedToVoid = false;

  const config = miniJsConfig || Object.create(null);

  if (config.useBabel === false) {
    return suffix ? [
      {
        test: reg,
        use: [
          {
            loader: 'mini-js-loader',
            options: {
              filename: `[name].${suffix}`,
              minimize: envComp('production'),
              undefinedToVoid,
            },
          },
        ],
        exclude: /(node_modules)/,
      }
    ] : [];
  }

  return suffix ? [{
    test: reg,
    use: [
      {
        loader: 'mini-js-loader',
        options: {
          filename: `[name].${suffix}`,
          minimize: envComp('production'),
          undefinedToVoid,
        },
      },
      {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'minify',
              {
                builtIns: envComp('production'),
                evaluate: envComp('production'),
                mangle: envComp('production'),
                undefinedToVoid,
              }
            ],
            [
              "@babel/preset-env",
              {
                "modules": false,
                "targets": {
                  "esmodules": false
                },
              },
            ]
          ],
          "plugins": [
            ...(undefinedToVoid ? ['transform-undefined-to-void-fn'] : []),
          ],
        },
      },
    ],
    exclude: /(node_modules)/,
  }, {
    test: reg,
    use: [
      {
        loader: 'mini-js-loader',
        options: {
          filename: `[name].${suffix}`,
          minimize: envComp('production'),
          undefinedToVoid,
        },
      },
    ],
    exclude: /(src)/,
  }] : [];
};
