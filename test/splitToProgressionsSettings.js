const assert = require('assert');

const SplitToProgressionsSettings = require('./../src/splitToProgressionsSettings');

describe( 'SplitToProgressionsSettings', () => {
    before(() => {
        //localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	describe( '#constructor', () =>  {
		it( 'should define some values', () =>  {
			const settings = new SplitToProgressionsSettings();
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
			const settings = new SplitToProgressionsSettings();
			settings.bounds.left = 0;
			settings.save();
			assert.notEqual( 0, localStorage.length, 'number of properties saved to the localStorage should be >0' );
		});
	});

	describe( '#load()', () =>  {
		it( 'should retrieve saved values from localStorage', () =>  {
			const settings = new SplitToProgressionsSettings();
			assert.equal( 0, settings.bounds.left );
		});
	});

	describe( '#pixelBounds()', () =>  {
		it( 'should convert em to pixels', () =>  {
			const settings = new SplitToProgressionsSettings();
			settings.bounds.left = 1;

			const bounds = settings.pixelBounds( 20 );
			assert.equal( 20, bounds.left );
		});
	});
});

