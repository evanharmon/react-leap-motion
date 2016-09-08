const path = require('path');
const validate = require('webpack-validator');
const merge = require('webpack-merge');
const parts = require('hss-webpack');


const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build')
};

const common = merge(
  {
    entry: {
      app: PATHS.app
    },
    output: {
      path: PATHS.build,
      filename: '[name].js'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    }
  },
  parts.indexTemplate({
    title: 'React LeapJS',
    appMountId: 'content'
  }),
  parts.loadJSX(PATHS.app)
);

let config = {};
switch (process.env.npm_lifecycle_event) {
  case 'build':
    config = merge.smart(
      common,
      parts.clean(PATHS.build),
      parts.setFreeVariable('process.env.NODE_ENV', 'development'),
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[hash].js',
          chunkFilename: '[hash].js'
        }
      },
      parts.extractBundle({
        name: 'vendor',
        entries: ['react', 'redux', 'immutable', 'expect', 'lodash']
      })
    );
    break;
  default:
    config = merge.smart(
      common,
      parts.clean(PATHS.build),
      parts.setFreeVariable('process.env.NODE_ENV', 'development'),
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[hash].js',
          chunkFilename: '[hash].js'
        }
      },
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = validate(config, { quiet: false });
