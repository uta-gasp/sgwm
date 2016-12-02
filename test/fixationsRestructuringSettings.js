const assert = require('assert');

const FixationsRestructuringSettings = require('./../src/fixationsRestructuringSettings');

describe( 'FixationsRestructuringSettings', () => {
    before(() => {
        //localStorage.itemInsertionCallback = (len) => { console.log(`Storage length: ${len}` ); };
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	describe( '#constructor', () =>  {
		it( 'should define some values', () =>  {
			const settings = new FixationsRestructuringSettings();
			let propCount = 0;
			for (let p in settings) {
				propCount += 1;
			}
			assert.notEqual( 0, propCount );
		});
	});

	describe( '#save()', () =>  {
		it( 'should save something to localStorage', () =>  {
			const settings = new FixationsRestructuringSettings();
			settings.mergingDistanceThreshold = 50;
			settings.save();
			assert.notEqual( 0, localStorage.length );
		});
	});

	describe( '#load()', () =>  {
		it( 'should retrieve saved values from localStorage', () =>  {
			const settings = new FixationsRestructuringSettings();
			assert.equal( 50, settings.mergingDistanceThreshold );
		});
	});
});
