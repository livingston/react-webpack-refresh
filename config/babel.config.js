'use strict';

const path = require('path');
const { config } = require('webpack');
const chalk = require('chalk');

const DEV_ENV = 'development';
const TEST_ENV = 'test';
const PROD_ENV = 'production';

const VALID_ENVS = [DEV_ENV, TEST_ENV, PROD_ENV];

module.exports = function (api) {
  console.log(chalk.keyword('orange').bold(`babel is running in ${chalk.bgKeyword('orange').white(` ${api.env()} `)} mode \n`));

  if (!api.env(VALID_ENVS)) {
    throw new Error(
      'It is required you specify `NODE_ENV` environment variable.' +
      'Valid values are "development", "test", and "production". ' +
      'Instead, received: ' + JSON.stringify(env) +
      '.'
    );
  }

  const configuration = {
    sourceType: "unambiguous",

    presets: [
      [
        require('@babel/preset-react').default,
        {
          development: api.env([DEV_ENV, TEST_ENV]),
          useBuiltIns: true,
          runtime: "automatic",
        },
      ],
    ],
    plugins: [
      require('babel-plugin-macros'),
      [
        require('@babel/plugin-proposal-class-properties').default,
        {
          loose: true,
        },
      ],
      require('@babel/plugin-proposal-optional-chaining').default,
      require('@babel/plugin-proposal-nullish-coalescing-operator').default,
      require('@babel/plugin-proposal-export-default-from').default,
    ],
  };

  if (api.env(TEST_ENV)) {
    configuration.presets.push([
      require('@babel/preset-env').default,
      {
        targets: {
          node: 'current',
        },
        exclude: ['transform-typeof-symbol'],
      },
    ]);
  }

  if (api.env(DEV_ENV)) {
    configuration.plugins.push(
      require.resolve('react-refresh/babel'),
    );
  }

  if (api.env([DEV_ENV, PROD_ENV])) {
    configuration.presets.push([
      require('@babel/preset-env').default,
      {
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
    ]);
  }

  if (api.env(PROD_ENV)) {
    configuration.plugins.push([
      require('babel-plugin-transform-react-remove-prop-types').default,
      { removeImport: true, },
    ]);
  }

  return configuration;
};