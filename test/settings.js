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

	describe( '#constructor', () =>  {
		it( 'should be empty', () =>  {
			const settings = new Settings();
			let propCount = 0;
			for (let p in settings) {
				propCount += 1;
			}
			assert.equal( 0, propCount );
		});
	});

	describe( '#save()', () =>  {
		it( 'should not save anything to localStorage', () =>  {
			const settings = new Settings();
			settings.save();
			assert.equal( 0, localStorage.length );
		});
	});
});

