const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取 css 到外部文件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩 css
const ManifestPlugin = require('webpack-manifest-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');

module.exports = env => {
  if (!env) {
    env = {}
  }
  let plugins = [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './app/views/index.html'
    }),
    new ManifestPlugin(),
    new InlineManifestWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
  ];
  if (env.production) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      // new ExtractTextPlugin("style.css", {
      //   ignoreOrder: true
      // }),
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
        chunkFilename: '[name].[hash].css',
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', {
            discardComments: {
              removeAll: true
            }
          }],
        },
        canPrint: true
      })
    )
  }
  return {
    entry: ['./app/js/viewport.js', './app/js/main.js'],
    devServer: {
      contentBase: './dist',
      hot: true,
      compress: true,
      port: 8080,
      clientLogLevel: "none",
      quiet: true
    },
    module: {
      rules: [{
          test: /\.html$/,
          use: [
            // 'cache-loader',
            'html-loader'
          ]
        },
        {
          test: /\.vue$/,
          use: [
            // 'cache-loader',
            'vue-loader'
          ]
        },
        {
          test: /\.(scss)$/,
          oneOf: [{
            resourceQuery: /module/,
            use: [
              env.production ? MiniCssExtractPlugin.loader : 'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]_[hash:base64:5]'
                }
              }, {
                loader: 'px2rem-loader',
                options: {
                  remUnit: 40,
                  remPrecision: 8
                }
              },
              'sass-loader'
            ]
          }, {
            use: [
              env.production ? MiniCssExtractPlugin.loader : 'vue-style-loader',
              'css-loader',
              {
                loader: 'px2rem-loader',
                options: {
                  remUnit: 40,
                  remPrecision: 8
                }
              },
              'sass-loader'
            ]
          }],
        },
        {
          test: /\.css$/,
          use: [env.production ? MiniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: [
        '.js', '.vue', '.json'
      ],
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    mode: 'production',
    devtool: 'inline-source-map',
    plugins,
    optimization: {
      runtimeChunk: 'single', // 创建单个运行时 bundle
      splitChunks: { // 将公用的依赖模块提取到已有的 chunk 中，或者生成一个新的 chunk
        cacheGroups: { // 将第三方库(library)（例如 lodash 或 react）提取到单独的 vendor chunk 文件中
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      },
    },
    output: {
      filename: '[name].[hash].js',
      path: path.resolve(__dirname, 'dist'),
      chunkFilename: '[name].[hash].js'
    }
  }
};
