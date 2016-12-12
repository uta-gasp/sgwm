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

	devtool: isDev ? 'source-map' : null,

	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify( NODE_ENV )
		})
	],

	resolve: {
		modulesDirectories: [ 'node_modules' ],
		extensions: [ '', '.js' ]
	},

	resolve: {
		modulesDirectories: [ 'node_modules' ],
		moduleTemplates: [ '*-loader' ],
		extensions: [ '', '.js' ]
	},

	module: {
		preLoaders: [
			{ test: /\.js$/, loader: "jshint", exclude: /node_modules/ },
			// { test: /\.js$/, loader: "eslint", exclude: /node_modules/ },
		],
		loaders: [
		]
	}
};

if (!isDev) {
	module.exports.module.loaders.push(
		{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ }
	);

	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true,
				drop_console: false,
				unsafe: true
			},
			lint: true,
			verbose: true
		})
	);
}
