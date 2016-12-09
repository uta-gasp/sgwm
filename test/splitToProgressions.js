const assert = require('chai').assert;

const splitToProgressions = require('./../src/splitToProgressions');
const SplitToProgressionsSettings = require('./../src/splitToProgressionsSettings');

describe( 'splitToProgressions', () => {
	const textHeight = 20;
	const ingtelineDistance = 50;

    before(() => {
    	const settings = new SplitToProgressionsSettings();
    	settings.bounds = {
			left: -2,
			right: 20,
			verticalChar: 2.5,
			verticalLine: 1
		};
    	settings.angle = Math.sin( 10 * Math.PI / 180 );
    	settings.save();
    });

	it( 'should make single progression', () =>  {
	    const fixations = [
	    	{x: 150, y: 100, duration: 300},
	    	{x: 200, y: 100, duration: 350},
	    	{x: 250, y: 100, duration: 400},
	    ];

	    const progressions = splitToProgressions( fixations, textHeight, ingtelineDistance );
	    assert.equal( 1, progressions.length );
	    assert.deepEqual( fixations, progressions[0] );
	});

	it( 'should make 2 progression', () =>  {
	    const fixations = [
	    	{x: 150, y: 100, duration: 300},
	    	{x: 200, y: 151, duration: 350},
	    	{x: 150, y: 100, duration: 400},
	    ];

	    const progressions = splitToProgressions( fixations, textHeight, ingtelineDistance );
	    assert.equal( 2, progressions.length );
	    assert.equal( 2, progressions[0].length );
	    assert.equal( 1, progressions[1].length );
	});

	it( 'should make 3 progression', () =>  {
	    const fixations = [
	    	{x: 150, y: 100, duration: 300},
	    	{x: 200, y: 151, duration: 350},
	    	{x: 200, y: 202, duration: 400},
	    	{x: 250, y: 610, duration: 400},
	    ];

	    const progressions = splitToProgressions( fixations, textHeight, ingtelineDistance );
	    assert.equal( 3, progressions.length );
	    assert.equal( 2, progressions[0].length );
	    assert.equal( 1, progressions[1].length );
	    assert.equal( 1, progressions[2].length );
	});
});
