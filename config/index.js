'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

var profile = process.env.NODE_PROFILE || 'dev'
console.log(profile)

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/web',
    proxyTable: {},

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 9000, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: false,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/web',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },

  profile: function () {

    var home = {
      host: '192.168.1.100',
      protocol: 'http',
      timeout: 6000,
      context: '/ims',
      ws: 'ws://' + this.host + ':8080/ims/ws/chat'
    }
    var ali = {
      host: '39.106.133.40',
      protocol: 'http',
      timeout: 6000,
      context: '/ims',
      ws: 'ws://' + this.host + ':8080/ims/ws/chat'
    }
    var company = {
      host: '192.168.183.100',
      protocol: 'http',
      timeout: 6000,
      context: '/ims',
      ws: 'ws://' + this.host + ':8080/ims/ws/chat'
    }
    var localhost = {
      host: 'localhost',
      protocol: 'http',
      timeout: 6000,
      context: '/ims',
      ws: 'ws://' + this.host + ':8080/ims/ws/chat'
    }

    return profile == 'ali' ? ali : profile == 'home' ? home : profile == 'company' ? company : localhost
  }

}
