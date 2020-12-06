'use strict';

process.on('unhandledRejection', err => {
  throw err;
});
const consoleClear = require('console-clear');
consoleClear(true);

const path = require('path');

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const paths = require('../config/paths');
const webpackConfigFactory = require('../config/webpack.config');
const chalk = require('chalk');
const appName = require(paths.pkgJSONPath).name;

const webpackConfig = webpackConfigFactory('development');
const app = express();

const compiler = webpack(webpackConfig);
const { publicPath } = webpackConfig.output;

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

app.use(webpackDevMiddleware(compiler, { publicPath }));
app.use(require("webpack-hot-middleware")(
  compiler,
  {
    log: false,
    path: `/__webpack_hmr`,
    heartbeat: 10 * 1000,
  }
));

app.use(function (req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const indexFilePath = path.join(compiler.outputPath, './index.html');
  compiler.outputFileSystem.readFile(indexFilePath, (err, result) => {
    res.set('content-type', 'text/html');

    if (err) {
      res.send(
        `<meta http-equiv="refresh" content="1">
        <center style="line-height: 100vh;">
          Hold your horses! Still bundling the files…
        </center>`
      );
    } else {
      res.send(result);
    }

    res.end();
  });
});

const server = app.listen(port, host, function (err) {
  if (err) {
    throw err;
  }

  const addr = server.address();
  let isFirstRun = true;

  compiler.hooks.done.tap('done', async function () {
    if (isFirstRun) {
      console.log(
        chalk.yellowBright(
          `You can now view %s in the browser.
          🚧 Running at ${chalk.cyan.bold('http://%s:%d/')}`
        ),
        chalk.bold(appName), addr.address, addr.port
      );
      console.log();
    }
    isFirstRun = false;
  });
});

['SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, function () {
    server.close();

    console.log()
    console.log(chalk.redBright(
      `${chalk.bold(appName)} server stopped!`
    ));
    process.exit();
  });
});
