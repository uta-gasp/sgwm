'use strict';

const webpack = require( 'webpack' );

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

module.exports = {
	context: __dirname + '/src',
	entry: './sgwm.js',
	output: {
		path: __dirname + '/build',
		filename: isDev ? 'sgwm.js' : 'sgwm.min.js',
		library: 'SGWM'
	},

	watch: isDev,
	watchOptions: {
		aggregateTimeout: 100
	},

	devtool: isDev ? 'source-map' : false,

	resolve: {
		modules: [
			__dirname + '/src',
			'node_modules'
		]
	},

	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify( NODE_ENV )
		})
	],

	module: {
		loaders: [
		]
	}
};

if (isDev) {
	module.exports.module.loaders.push({
		test: /\.js$/, loader: "jshint-loader", exclude: /node_modules/
	});
	module.exports.jshint = {
		esversion: 6,
		strict: 'global',
		browser: true
	};
}
else {
	module.exports.module.loaders.push(
		{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['es2015'] } }
	);

	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				unsafe: true
			},
			lint: false
		})
	);
}
