const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/js/main.js",
  output: {
    filename: "bundle.js",
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
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/data", to: "data" },
        { from: "src/config", to: "config" },
      ],
    }),
  ],
};
