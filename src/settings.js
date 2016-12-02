/*
	Base class for settings
*/
class Settings {
	constructor( name ) {
		this._name = name;
	}

	load() {
		const hiddenProps = Object.keys(new Settings(''));

		for (const p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			const value = JSON.parse( localStorage.getItem( this._name + '_' + p ) );
			if (value !== null) {
				this[p] = value;
			}
		}
	}

	save() {
		const hiddenProps = Object.keys(new Settings(''));

		for (const p in this) {
			if (hiddenProps.indexOf( p ) > -1) {
				continue;
			}
			localStorage.setItem( this._name + '_' + p, JSON.stringify( this[p] ) );
		}
	}
}

module.exports = Settings;