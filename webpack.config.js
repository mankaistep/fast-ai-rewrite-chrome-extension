const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const isDev = argv.mode === 'development' || env.dev;

    return {
        mode: isProduction ? 'production' : 'development',
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
                    use: ['style-loader', 'css-loader', 'postcss-loader']
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
        devtool: isDev ? 'inline-source-map' : false,
        optimization: {
            minimize: !isDev
        }
    };
};