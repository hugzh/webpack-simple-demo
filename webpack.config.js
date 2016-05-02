var path = require('path');
var webpack = require('webpack');
var glob = require('glob');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var getEntry = function() {
    var entry = {};
    //读取开发目录,并进行路径裁剪
    glob.sync('./src/**/*.js')
        .forEach(function(name) {
            var start = name.indexOf('src/') + 4,
                end = name.length - 3;
            var n = name.slice(start, end);
            n = n.slice(0, n.lastIndexOf('/'));
            //保存各个组件的入口
            entry[n] = name;
        });
    return entry;
};
var prod = process.env.NODE_ENV === 'production' ? true : false;
module.exports = {
    entry: getEntry(),
    output: {
        path: path.resolve(__dirname, prod ? "./dist" : "./build"),
        filename: prod ? "js/[name].min.js" : "js/[name].js",
        chunkFilename: 'js/[name].chunk.js',
        publicPath: prod ? "http:cdn.mydomain.com" : ""
    },
    resolve: {
        //配置项,设置忽略js后缀
        extensions: ['', '.js', '.less', '.css', '.png', '.jpg'],
        root: './src',
        // 模块别名
        alias: {}
    },
    module: {
        loaders: [{
            test: /\.(png|jpg|jpeg|gif)$/,
            loader: 'url?limit=10000&name=images/[name].[ext]'
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style', 'css!less')
        }, {
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel?presets[]=es2015&presets[]=react'
        }, {
            test: /\.html$/,
            loader: 'html?attrs=img:src img:srcset'
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index/index.html'
        }),
        new CleanPlugin(['dist', 'build']),
        // 启动热替换
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('[name].css', {
            allChunks: true
        }),
        new webpack.NoErrorsPlugin(),
        new OpenBrowserPlugin({
            url: 'http://localhost:8080'
        }),
        /* 公共库 */
        new CommonsChunkPlugin({
            name: 'vendors',
            minChunks: Infinity
        }),
    ]
};
// 判断开发环境还是生产环境,添加uglify等插件
if (process.env.NODE_ENV === 'production') {
    module.exports.plugins = (module.exports.plugins || [])
        .concat([
            new webpack.DefinePlugin({
                __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
        ]);
} else {
    module.exports.devtool = 'source-map';
    module.exports.devServer = {
        port: 8080,
        contentBase: './build',
        hot: true,
        historyApiFallback: true,
        publicPath: "",
        stats: {
            colors: true
        },
        plugins: [
        new webpack.HotModuleReplacementPlugin()
        ]
    };
}