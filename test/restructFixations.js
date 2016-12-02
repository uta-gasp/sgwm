const assert = require('chai').assert;
const expect = require('chai').expect;

const restructFixations = require('./../src/restructFixations');
const FixationsRestructuringSettings = require('./../src/fixationsRestructuringSettings');

describe( 'restructFixations', () => {
    before(() => {
    	const settings = new FixationsRestructuringSettings();
    	settings.enabled = true;
    	settings.mergingDistanceThreshold = 40;
    	settings.mergingDurationThreshold = 150;
    	settings.removingDurationThreshold = 150;
    	settings.save();
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	it( 'should not remove anything', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 300},
	    	{x: 100, y: 130, duration: 350},
	    	{x: 200, y: 100, duration: 400},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.deepEqual( fixations, restructured )
	});

	it( 'should join the first to the second', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 100},
	    	{x: 100, y: 130, duration: 300},
	    	{x: 200, y: 100, duration: 400},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, fixations.length - 1 );
	    assert.equal( restructured[0].duration, fixations[0].duration + fixations[1].duration );
	    assert.deepEqual( restructured[1], fixations[2] );
	});

	it( 'should remove first', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 100},
	    	{x: 100, y: 200, duration: 300},
	    	{x: 200, y: 100, duration: 400},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, fixations.length - 1 );
	    assert.deepEqual( restructured[0], fixations[1] );
	    assert.deepEqual( restructured[1], fixations[2] );
	});

	it( 'should join second to the third', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 300},
	    	{x: 170, y: 100, duration: 100},
	    	{x: 200, y: 100, duration: 400},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, fixations.length - 1 );
	    assert.equal( restructured[1].duration, fixations[1].duration + fixations[2].duration );
	    assert.deepEqual( restructured[0], fixations[0] );
	});

	it( 'should join third to the second', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 300},
	    	{x: 170, y: 100, duration: 400},
	    	{x: 200, y: 100, duration: 100},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, fixations.length - 1 );
	    assert.equal( restructured[1].duration, fixations[1].duration + fixations[2].duration );
	    assert.deepEqual( restructured[0], fixations[0] );
	});

	it( 'should remove the last', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 400},
	    	{x: 130, y: 100, duration: 300},
	    	{x: 200, y: 100, duration: 100},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, fixations.length - 1 );
	    assert.deepEqual( restructured[0], fixations[0] );
	    assert.deepEqual( restructured[1], fixations[1] );
	});
});

