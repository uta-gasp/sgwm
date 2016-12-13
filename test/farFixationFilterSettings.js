const assert = require('assert');

const FarFixationFilterSettings = require('./../src/FarFixationFilterSettings');

describe( 'FarFixationFilterSettings', () => {
    before(() => {
        //localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	describe( '#constructor', () =>  {
		it( 'should define some values', () =>  {
			const settings = new FarFixationFilterSettings();
			let propCount = 0;
			for (let p in settings) {
				if (settings.hasOwnProperty( p )) {
					propCount += 1;
				}
			}
			assert.notEqual( 0, propCount, 'number of properties should be >0' );
		});
	});

	describe( '#save()', () =>  {
		it( 'should save something to localStorage', () =>  {
			const settings = new FarFixationFilterSettings();
			settings.marginX = 100;
			settings.marginY = 250;
			settings.save();
			assert.notEqual( 0, localStorage.length, 'number of properties saved to the localStorage should be >0' );
		});
	});

	describe( '#load()', () =>  {
		it( 'should retrieve saved values from localStorage', () =>  {
			const settings = new FarFixationFilterSettings();
			assert.equal( 100, settings.marginX );
			assert.equal( 250, settings.marginY );
		});
	});
});

