const path = require('path');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
	mode: 'development',
	devtool: 'cheap-source-map',
	// devtool: 'cheap-module-eval-source-map',
	entry: {
		main: './index.js',
	},
	output: {
		path: path.join(__dirname, '../build/js'),
		filename: `[name].bundle.js`,
	},
	resolve: {
		// extensions: ['.ts'],
	},
	module: {
		// rules: [{
		// 	test: /\.ts$/,
		// 	use: [{
		// 		loader: 'ts-loader',
		// 		options: {
		// 			transpileOnly: true,
		// 			experimentalWatchApi: true,
		// 		},
		// 	}],
		// }],
	},
	optimization: {
		// removeAvailableModules: false,
		// removeEmptyChunks: false,
		// splitChunks: false,
	},
	plugins: [
		// new ForkTsCheckerWebpackPlugin(),
	],
};
