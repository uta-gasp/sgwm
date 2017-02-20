/*
	Base class for settings
*/
'use strict';

class Settings {
	// Arguments:
	//	 name (string): settings own namespace (without domain which is defined in the class)
	constructor( name ) {
		this._name = name;
		this._domain = 'sgwm';
		this._isInitialized = false;

		this._fullPath = function( name ) {
			return [ this._name, name ].join( '_' );
		};
	}

	load() {
		const hiddenProps = Object.keys(new Settings(''));
		const allSettings = JSON.parse( localStorage.getItem( this._domain ) );
		this._isInitialized = allSettings && allSettings[ this._name ];

		for (let p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			const value = allSettings ? allSettings[ this._fullPath( p ) ] : null;
			if (value !== null) {
				this[p] = value;
			}
		}
	}

	save() {
		const hiddenProps = Object.keys(new Settings(''));
		const allSettings = JSON.parse( localStorage.getItem( this._domain ) ) || {};

		for (let p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			allSettings[ this._fullPath( p ) ] = this[p];
		}

		localStorage.setItem( this._domain, JSON.stringify( allSettings ) );
	}

	get isInitialized() { return this._isInitialized; }
}

module.exports = Settings;