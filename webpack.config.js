const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development', // Set this to 'production' for production builds
    entry: {
        popup: './src/popup.tsx',
        background: './src/background.ts',
        'content-script': './src/content-script.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css']
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'public', to: '.' }]
        }),
    ],
    devtool: 'cheap-module-source-map'
};