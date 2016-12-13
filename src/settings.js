/*
	Base class for settings
*/
'use strict';

class Settings {
	constructor( name ) {
		this._name = name;
		this._domain = 'sgwm';

		this._fullPath = function( name ) {
			return [ this._domain, this._name, name ].join( '_' );
		};
	}

	load() {
		const hiddenProps = Object.keys(new Settings(''));

		for (let p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			const value = JSON.parse( localStorage.getItem( this._fullPath( p ) ) );
			if (value !== null) {
				this[p] = value;
			}
		}
	}

	save() {
		const hiddenProps = Object.keys(new Settings(''));

		for (let p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			localStorage.setItem( this._fullPath( p ), JSON.stringify( this[p] ) );
		}
	}
}

module.exports = Settings;