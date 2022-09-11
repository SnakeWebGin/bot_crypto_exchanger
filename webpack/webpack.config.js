const path = require("path");
const webpack = require('webpack');
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    target: "electron-main",
    output: {
        filename: "server.js",
        path: path.resolve(__dirname, '../bin'),
        libraryTarget: 'umd'
    },
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    },
    module: {
        rules: [
            {
                // Include ts, tsx, js, and jsx files.
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ })
    ],
    externals: {
        express: 'express',
    },
    node: {
        __dirname: false
    }
};
