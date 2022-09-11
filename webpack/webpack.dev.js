const webpack = require('webpack');
const server = require('./webpack.config');

server.mode = "development";
server.devtool = "cheap-module-eval-source-map"; //"eval-source-map";
server.plugins.push(new webpack.HotModuleReplacementPlugin());
server.devServer = {
    historyApiFallback: true
};

module.exports = server;
