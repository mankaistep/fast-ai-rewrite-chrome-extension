const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        content_script: './src/content_script.tsx',
        background: './src/background.ts',
        popup: './src/popup.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public' }, // This will copy all files from the public folder to the output folder
            ],
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
};