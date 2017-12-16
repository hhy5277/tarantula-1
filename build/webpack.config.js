'use strict'

    const webpack = require('webpack'),
                _ = require("lodash"),
ExtractTextPlugin = require('extract-text-webpack-plugin'),
HtmlWebpackPlugin = require('html-webpack-plugin'),
HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin'),
HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin'),
ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin'),
 HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

const isProduction = process.env.NODE_ENV == 'production'
const ROOT_PATH = `${__dirname}/../lib/assets/frontend`
const OUTPUT_PATH = `${__dirname}/../lib/public`

const devPort = (function randomPort(){
  const n = parseInt(Math.random() * 10000)

  if (n > 1024){
    return n
  }

  return randomPort()
})()

const config = {
  entry: [`${ROOT_PATH}/index.vue`],

  output: {
    path: OUTPUT_PATH,
    publicPath: "./"
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: {
              loader: 'babel-loader',
            },
            'scss': 'vue-style-loader!css-loader!sass-loader!autoprefixer-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader!autoprefixer-loader?indentedSyntax',
            less: ExtractTextPlugin.extract({
                 use: ['css-loader?minimize', 'autoprefixer-loader', 'less-loader'],
                 fallback: 'vue-style-loader'
             }),
             css: ExtractTextPlugin.extract({
                 use: ['css-loader', 'autoprefixer-loader', 'less-loader'],
                 fallback: 'vue-style-loader'
             })
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            use: ['css-loader?minimize', 'autoprefixer-loader'],
            fallback: 'style-loader'
        })
      },

      {
        test: /\.svg$/,
        loader: 'svg-inline-loader?classPrefix',
        exclude: /node_modules/
      },

      // {
      //    test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
      //    loader: 'url-loader?limit=1024'
      // },

      // {
      //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      // }
    ]
  },

  externals: {
    "vue": "Vue",
    "vuex": "Vuex",
    lodash: "_",
  },

  resolve: {
    extensions: ['.js', '.vue'],
    // alias: {
    //     'vue': 'vue/dist/vue.esm.js'
    // }
  },

  devServer: {
    port: devPort,
    historyApiFallback: true,
    noInfo: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  },

  plugins: [new webpack.DefinePlugin({
    isProduction: JSON.stringify(isProduction),
    'process.env.NODE_ENV': `'${process.env.NODE_ENV || "development"}'`,
  })],
  devtool: isProduction ? "cheap-module-source-map" : "cheap-module-eval-source-map"
}


if (isProduction){
  config.output.filename = 'javascripts/bundle-[chunkhash].js'

  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      // mangle: {
      //   except: ['$super', '$', 'exports', 'require']
      // },
      minimize: true,
      output: {comments: false}
  }))

  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
}else{
  config.output.filename = 'javascripts/bundle.js'
  config.output.publicPath = `http://localhost:${devPort}/static/dist/`
}


const assets = [
  '//cdn.jsdelivr.net/npm/vuetify@0.17.2/dist/vuetify.min.css',
  '//cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',

  '//cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js',
  '//cdn.jsdelivr.net/npm/moment@2.19.2/moment.min.js',
  '//cdn.jsdelivr.net/npm/vue@2.5.2/dist/vue.min.js',
  '//cdn.jsdelivr.net/npm/vue-router@3.0.1/dist/vue-router.min.js',
  '//cdn.jsdelivr.net/npm/vue-resource@1.3.4/dist/vue-resource.min.js',
  '//cdn.jsdelivr.net/npm/vuex@3.0.1/dist/vuex.min.js',
  '//cdn.jsdelivr.net/npm/vue-meta@1.4.0/lib/vue-meta.min.js',
  '//cdn.jsdelivr.net/npm/vue-i18n@7.3.2/dist/vue-i18n.min.js',
  '//cdn.jsdelivr.net/npm/vue-markdown@2.2.4/dist/vue-markdown.min.js',
  '//cdn.jsdelivr.net/npm/highcharts@6.0.3/highcharts.min.js',
  '//cdn.jsdelivr.net/npm/vuetify@0.17.2/dist/vuetify.min.js',
  'https://buttons.github.io/buttons.js'
]

config.plugins = config.plugins.concat([
  new HtmlWebpackPlugin({
    alwaysWriteToDisk: true,
    filename: '../views/layout/vue.ejs',
    // filename: '../../views/layout/vue.ejs',
    template: './lib/views/template/vue.html',
    inject: true,
    // hash: true,
    // minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true
    // },
    // chunksSortMode: 'dependency'
  }),
  new HtmlWebpackHarddiskPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    append: false,
    publicPath: "",
    assets: [
      // { path: '//fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons', type: 'css' },
      { path: '//fonts.cat.net/css?family=Roboto:300,400,500,700|Material+Icons', type: 'css' },

    ].concat(_.chain(assets).map((n) => {
      if (isProduction){
        return n
      }

      return n.replace(/\.min\./, ".")
    }).value())
  }),
  new ScriptExtHtmlWebpackPlugin({
    custom: [
      {
        test: /buttons.js/,
        attribute: ['defer async']
      },
    ]
  }),
  new HtmlReplaceWebpackPlugin([
    {
      //pattern: /(<!--\s*|@@)(css|js|img):([\w-\/]+)(\s*-->)?/g,
      pattern: /<!-- ejs -->/g,
      replacement: "<%- body %>"
    }
  ])
])

// config.plugins.push(function() {
//   this.plugin("done", function(stats) {
//     console.log(stats.hash)
//     // require("fs").writeFileSync(
//     //   path.join(__dirname, "...", "stats.json"),
//     //   JSON.stringify(stats.toJson()));
//   });
// })


module.exports = config
