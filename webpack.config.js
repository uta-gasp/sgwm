'use strict';

const webpack = require( 'webpack' );

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
	context: __dirname + '/src',
	entry: './sgwm.js',
	output: {
		filename: 'sgwm.js',
		library: 'SGWM'
	},

	watch: NODE_ENV === 'development',
	watchOptions: {
		aggregateTimeout: 100
	},

	devtool: NODE_ENV === 'development' ? 'source-map' : null,

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
			{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ }
		]
	}
};

if (NODE_ENV === 'production') {
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