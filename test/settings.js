const assert = require('assert');

const Settings = require('./../src/settings');

class MySetting {
	constructor() {
		this._myVar = 42;
	}
	get myVar() { return this._myVar; }
	set myVar( value ) { this._myVar = value; }
}

class MySettings extends Settings {
	constructor() {
		super( 'mySettings' );
		this._mySetting = new MySetting();
		this.load();
	}

	load() {
		super.load();
		this._mySetting = Object.assign( new MySetting(), this._mySetting );
	}

	get mySetting() { return this._mySetting; }
	set mySetting( value ) { this._mySetting = value; }
}

describe( 'Settings', () => {
    beforeEach(() => {
//        localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    afterEach(() => {
        localStorage.clear();
//        localStorage.itemInsertionCallback = null;
    });

	describe( '#save()', () =>  {
		it( 'should not save anything to localStorage', () =>  {
			const settings = new Settings();
			settings.save();
			assert.equal( 0, localStorage.length, 'should be no settings saved' );
		});

		it( 'should save one variable to localStorage', () =>  {
			const settings = new MySettings();
			settings.mySetting.myVar = 1337;
			settings.save();
			assert.equal( 1, localStorage.length, 'should be 1 setting saved' );
		});
	});

	describe( '#load()', () =>  {
		it( 'should load one variable from localStorage', () =>  {
			const settings1 = new MySettings();
			settings1.mySetting.myVar = 1337;
			settings1.save();

			const settings2 = new MySettings();
			assert.equal( settings2.mySetting.myVar, 1337, 'mySettings.myVar should be 1337' );
		});
	});
});
