'use strict';

const path = require('path');

const appRoot = path.resolve(__dirname, '../');

const appSrc = path.resolve(appRoot, './src');
const appDist = path.resolve(appRoot, './dist');

const appConfig = path.resolve(appRoot, './config');

const pkgJSONPath = path.resolve(appRoot, './package.json');

module.exports = {
  appRoot,
  appSrc,
  appDist,
  appConfig,
  pkgJSONPath
};