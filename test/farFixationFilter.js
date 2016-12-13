const assert = require('chai').assert;

const farFixationFilter = require('./../src/farFixationFilter');
const FarFixationFilterSettings = require('./../src/farFixationFilterSettings');

describe( 'farFixationFilter', () => {
	const textbox = {
		left: 200,
		right: 1000,
		top: 200,
		bottom: 600
	};

    before(() => {
    	const settings = new FarFixationFilterSettings();
    	settings.enabled = true;
    	settings.marginX = 100;
    	settings.marginY = 150;
    	settings.save();
    });

	it( 'should not remove anything', () =>  {
	    const fixations = [
	    	{x: 150, y: 100, duration: 300},
	    	{x: 300, y: 300, duration: 350},
	    	{x: 1050, y: 700, duration: 400},
	    ];

	    const filtered = farFixationFilter( fixations, textbox );
	    assert.deepEqual( fixations, filtered, 'input and output fixations do not match' )
	});

	it( 'should remove first', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 100},
	    	{x: 300, y: 300, duration: 350},
	    	{x: 1050, y: 700, duration: 400},
	    ];

	    const filtered = farFixationFilter( fixations, textbox );
	    assert.equal( filtered.length, fixations.length - 1, 'length was not decreased by 1' );
	    assert.deepEqual( filtered[0], fixations[1], 'input.1 !== output.0' );
	    assert.deepEqual( filtered[1], fixations[2], 'input.2 !== output.1' );
	});

	it( 'should remove the last', () =>  {
	    const fixations = [
	    	{x: 300, y: 300, duration: 350},
	    	{x: 1050, y: 700, duration: 400},
	    	{x: 1000, y: 1000, duration: 100},
	    ];

	    const filtered = farFixationFilter( fixations, textbox );
	    assert.equal( filtered.length, fixations.length - 1, 'length was not decreased by 1' );
	    assert.deepEqual( filtered[0], fixations[0], 'input.0 !== output.0' );
	    assert.deepEqual( filtered[1], fixations[1], 'input.1 !== output.1' );
	});
});

