/*
	Base class for settings
*/
class Settings {
	constructor() {
	}

	load() {
		for (const p in this) {
			const value = JSON.parse( localStorage.getItem( p ) );
			if (value !== null) {
				this[p] = value;
			}
		}
	}

	save() {
		for (const p in this) {
			localStorage.setItem( p, JSON.stringify( this[p] ) );
		}
	}
}

module.exports = Settings;