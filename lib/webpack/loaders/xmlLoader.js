module.exports = function xmlLoader(xmlEntrySuffix) {
  return [
    {
      test: new RegExp(`.${xmlEntrySuffix}$`, "i"),
      use: [
        {
          loader: "mini-xml-loader",
          options: {
            filename: `[name].${xmlEntrySuffix}`,
            minimize: false,
            fallback: null,
          },
        },
      ],
    },
  ];
};
