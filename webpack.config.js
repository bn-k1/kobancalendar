const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/js/app.js",
    meetup: "./src/js/meetup.js",
  },
  output: {
    filename: "js/[name].bundle.js", // [name] でエントリーポイント名が使われる
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    static: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.csv$/,
        use: [
          {
            loader: "csv-loader",
            options: {
              dynamicTyping: true,
              header: false,
              skipEmptyLines: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@data": path.resolve(__dirname, "src/data"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/meetup.html",
      filename: "meetup.html",
      chunks: ["meetup"],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
};
