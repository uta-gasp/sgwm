const assert = require('assert');

const ProgressionMergerSettings = require('./../src/progressionMergerSettings');

describe( 'ProgressionMergerSettings', () => {
    before(() => {
        //localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	describe( '#constructor', () =>  {
		it( 'should define some values', () =>  {
			const settings = new ProgressionMergerSettings();
			let propCount = 0;
			for (let p in settings) {
				propCount += 1;
			}
			assert.notEqual( 0, propCount );
		});
	});

	describe( '#save()', () =>  {
		it( 'should save something to localStorage', () =>  {
			const settings = new ProgressionMergerSettings();
			settings.minLongSetLength = 4;
			settings.fitThreshold = 0.9;
			settings.save();
			assert.notEqual( 0, localStorage.length );
		});
	});

	describe( '#load()', () =>  {
		it( 'should retrieve saved values from localStorage', () =>  {
			const settings = new ProgressionMergerSettings();
			assert.equal( 4, settings.minLongSetLength );
			assert.equal( 0.9, settings.fitThreshold );
		});
	});
});

