const assert = require('assert');

const Settings = require('./../src/settings');

describe( 'Settings', () => {
    before(() => {
        localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    after(() => {
        localStorage.clear();
        localStorage.itemInsertionCallback = null;
    });

	describe( '#save()', () =>  {
		it( 'should not save anything to localStorage', () =>  {
			const settings = new Settings();
			settings.save();
			assert.equal( 0, localStorage.length, 'should be no settings saved' );
		});
	});
});

