const assert = require('chai').assert;
const expect = require('chai').expect;

const restructFixations = require('./../src/restructFixations');
const FixationsRestructuringSettings = require('./../src/fixationsRestructuringSettings');

describe( 'restructFixations', () => {
    before(() => {
    	const settings = new FixationsRestructuringSettings();
    	settings.enabled = true;
    	settings.save();
    });

    after(() => {
        localStorage.clear();
        //localStorage.itemInsertionCallback = null;
    });

	it( 'should not remove anything', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 100},
	    	{x: 100, y: 130, duration: 300},
	    	{x: 200, y: 100, duration: 300},
	    ];

	    const restructured = restructFixations( fixations );
	    assert.equal( restructured.length, 3 );
	});

	it( 'should remove first fixation', () =>  {
	    const fixations = [
	    	{x: 100, y: 100, duration: 100},
	    	{x: 100, y: 130, duration: 100},
	    	{x: 200, y: 100, duration: 300},
	    ];

	    const restructured = restructFixations( fixations );
	    //expect( restructured ).to.have.deep.property( 'length', 3 ).and.to.have.deep.property( '[0].y', 130 );
	    assert( restructured.length, 3 );
	    assert( restructured[0].y, 130 );
	});
});

