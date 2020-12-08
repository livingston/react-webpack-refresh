'use strict';

const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const paths = require('./paths');

const DEV_ENV = 'development';
const PROD_ENV = 'production';

const VALID_ENVS = [DEV_ENV, PROD_ENV];

function getHTMLWebpackConfig (isProd) {
  if (isProd) {
    return {
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    };
  }
  return {};
}

module.exports = function(env) {
  if (typeof env == 'string' && !VALID_ENVS.includes(env)) {
    throw new Error(
      'Valid values are "development", and "production". ' +
      'Instead, received: ' + JSON.stringify(env) +
      '.'
    );
  }

  const isProdEnv = env?.production ?? env === PROD_ENV;
  const isDevEnv = env?.development ?? env === DEV_ENV;
  const mode = isProdEnv ? PROD_ENV : isDevEnv && DEV_ENV;

  console.log(chalk.cyan.bold(`Webpack is running in ${chalk.bgCyan.white(` ${mode} `)} mode`));

  const webpackConfig = {
    target: 'browserslist',
    mode,
    bail: isProdEnv,
    devtool: isProdEnv ? 'source-map' : 'cheap-module-source-map',

    entry: [path.resolve(paths.appSrc, './index.js')],
    output: {
      filename: '[name].[contenthash].js',
      path: paths.appDist,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_module/,
          include: paths.appSrc,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              configFile: path.resolve(paths.appConfig, './babel.config.js'),
              cacheCompression: false,
              compact: isProdEnv,
            }
          }
        },
        {
          test: /\.css$/,
          exclude: /node_module/,
          include: paths.appSrc,
          use: ['style-loader', 'css-loader'],
        }
      ]
    },

    optimization: {
      minimize: isProdEnv,

      splitChunks: {
        chunks: 'all',
        name: false,
      },

      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },

    plugins: [
      new CaseSensitivePathsPlugin(),
      new CleanWebpackPlugin(),
      new HTMLWebpackPlugin({
        inject: true,
        template: path.resolve(paths.appSrc, './index.template.html'),

        ...getHTMLWebpackConfig(isProdEnv),
      }),
    ],
  };

  if (isDevEnv) {
    webpackConfig.infrastructureLogging = {
      // level: 'none',
    };

    webpackConfig.entry.unshift(
      'webpack-hot-middleware/client?overlay=false&noInfo=true&reload=true',
    );

    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin({
        overlay: {
          sockIntegration: 'whm',
        },
      }),
    );
  }

  return webpackConfig;
};
