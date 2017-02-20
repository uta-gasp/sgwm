'use strict';

const webpack = require( 'webpack' );

const NODE_ENV = process.env.NODE_ENV || 'development';
const TYPE = process.env.TYPE || 'lib';
const isDev = NODE_ENV === 'development';
const suffix = (TYPE === 'lib' ?  '' : '.module') +
				(isDev ? '' : '.min') +
				'.js'

module.exports = {
	context: __dirname + '/src',
	entry: './sgwm.js',
	output: {
		path: __dirname + '/build',
		filename: 'sgwm' + suffix,
		libraryTarget: TYPE === 'lib' ? 'var' : 'commonjs2',
		library: 'SGWM'
	},

	watch: false,
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
		test: /\.js$/, loader: 'jshint-loader', exclude: /node_modules/
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
