var path = require('path');
var webpack = require('webpack');
var glob = require('glob');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var HtmlWebpackPlugin = require('html-webpack-plugin');
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
module.exports = {
    entry: getEntry(),
    output: {
        path: path.resolve(__dirname + "/dist"),
        filename: "./js/[name].js",
        publicPath: "/assets"
    },
    resolve: {
        //配置项,设置忽略js后缀
        extensions: ['', '.js', '.less', '.scss', '.css', '.png', '.jpg'],
        // 模块别名
        alias: {}
    },
    module: {
        loaders: [
            {
                test: /\.png|jpg|jpeg|gif$/,
                loader: "url?limit=10000&name=./images/[name].[ext]?[hash:10]"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.|less$/,
                loader: ExtractTextPlugin.extract("style-loader", "less-loader")
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=es2015'
            }
        ]
    },
    babel: { //配置babel支持ES6
        "presets": ["es2015"],
        "plugins": ["transform-runtime"]
    },
    plugins: [
        new ExtractTextPlugin('./css/[name].css'),
        // new HtmlWebpackPlugin('./html/[name].html'),
        // 启动热替换
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin("style.css", {
            allChunks: true
        }),
    new webpack.NoErrorsPlugin()
        /*,
                new OpenBrowserPlugin({
                    url: 'http://localhost:8080'
                })*/
    ]
};
// 判断开发环境还是生产环境,添加uglify等插件
if (process.env.NODE_ENV === 'production') {
    module.exports.plugins = (module.exports.plugins || [])
        .concat([
        new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
        new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.EnvironmentPlugin([
          "NODE_ENV"
        ])
    ]);
} else {
    module.exports.devtool = 'source-map';
    module.exports.devServer = {
        port: 8080,
        contentBase: './dist',
        hot: true,
        historyApiFallback: true,
        publicPath: "/assets",
        stats: {
            colors: true
        }
    };
}