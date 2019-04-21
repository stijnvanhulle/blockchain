const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const path = require("path");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const chalk = require("chalk");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const dotenv = require("dotenv");
const Dotenv = require("dotenv-webpack");
const OfflinePlugin = require("offline-plugin");

const pkg = require("../package.json");

const dotEnvPath = path.resolve(process.cwd(), ".env");

dotenv.config({ path: dotEnvPath });

console.log("proxy", process.env.PROXY);

const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || false;

const config = {
  entry: isDev ? ["react-hot-loader/patch", "./src/index.jsx"] : ["@babel/polyfill", "./src/index.jsx"],
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "js/bundle.js",
    publicPath: "/",
  },
  devServer: {
    hot: isDev,
    compress: !isDev,
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    publicPath: "/",
    historyApiFallback: true,
    contentBase: "./src",
    overlay: true,
    proxy: {
      "/api": {
        target: process.env.PROXY || pkg.proxy,
        pathRewrite: { "^/api": "" },
      },
    },
  },
  mode: process.env.NODE_ENV || "production",
  devtool: isDev ? "source-map" : false,
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, "../src/index.html"),
          to: path.resolve(__dirname, "../build"),
        },
      ],
      {},
    ),
    new CopyWebpackPlugin(
      [
        {
          from: "./src/assets",
          to: path.resolve(__dirname, "../build/assets"),
        },
      ],
      {},
    ),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "/css/[name].css",
      chunkFilename: "/css/[id].css",
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new Dotenv({
      path: dotEnvPath,
      systemvars: true,
      silent: true,
    }),
    new ProgressBarPlugin({
      format:
        `${chalk.blue.bold("Building [:bar] ") + chalk.blue.bold(":percent")} (:elapsed seconds)`,
      clear: false,
    }),
    new EventHooksPlugin({
      done: () => {
        console.log("------------------------------------");
        console.log("Environment: ", process.env.NODE_ENV);
        console.log(`Serving at http://localhost:${config.devServer.port}`);
        if (config.devServer.proxy[0]) {
          console.log(
            "With proxy",
            config.devServer.proxy[0].target + config.devServer.proxy[0].context,
          );
        }

        console.log("------------------------------------");
      },
    }),
  ],
  target: "web",
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      request: "browser-request",
      "react-dom": "@hot-loader/react-dom",
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules(?!\/bf-component-library)/,
        use: [
          {
            loader: "babel-loader",
          },
          { loader: "eslint-loader" },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },

      {
        test: /\.scss/,
        use: [
          isDev ? { loader: "style-loader" } : MiniCssExtractPlugin.loader,

          {
            loader: "css-loader",
            options: {
              minimize: true,
            },
          },
          {
            loader: "postcss-loader",
            options: path.resolve(__dirname, "./postcss.config.js"),
          },
          {
            loader: "sass-loader",
          },
          {
            loader: "@epegzz/sass-vars-loader",
            options: {
              syntax: "scss",
              // to make branding work you have to copy branding
              // from components library and change colors.
              files: [path.resolve(__dirname, "./branding.json")],
            },
          },
        ],
      },

      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "fonts/",
          publicPath: "/fonts/",
          context: "src",
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "images/",
          publicPath: "/images",
          context: "src",
        },
      },
    ],
  },
};

if (isDev) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  /*
  config.plugins.push(
    new UglifyJsPlugin({
      sourceMap: false,
      cache: true,
      uglifyOptions: {
        ecma: 8
      }
    })
  ); */
  config.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: false,
        cache: true,
        uglifyOptions: {
          ecma: 8,
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  };
  config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
}

module.exports = config;
