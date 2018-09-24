const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'cheap-source-map',
	// devtool: 'cheap-module-eval-source-map',
	entry: {
		main: './js/App.js',
	},
	output: {
		path: path.join(__dirname, './build/js'),
		filename: `bundle.js`,
	},
	resolve: {
		// extensions: ['.ts'],
	},
	module: {
		// rules: [{
		// 	test: /\.ts$/,
		// 	use: [{
		// 		loader: 'awesome-typescript-loader',
		// 	}],
		// }],
	},
};
