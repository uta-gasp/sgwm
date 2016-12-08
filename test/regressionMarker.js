const assert = require('chai').assert;

const regressionMarker = require('./../src/regressionMarker');

describe( 'regressionMarker', () => {

	it( 'should find 1 regression', () =>  {
		const fixations = [
	    	{x: 150, y: 100, duration: 300, line: 0, word: {index: 0}},
	    	{x: 200, y: 120, duration: 350, line: 0, word: {index: 1}},
	    	{x: 250, y: 110, duration: 400, line: 0, word: {index: 1}},
	    	{x: 170, y: 120, duration: 300, line: 0, word: {index: 0}},
	    	{x: 230, y: 110, duration: 300, line: 0, word: {index: 1}},
	    	{x: 300, y: 120, duration: 300, line: 0, word: {index: 2}},
	    	{x: 350, y: 110, duration: 300, line: 0, word: {index: 2}},
	    	{x: 140, y: 175, duration: 300, line: 1, word: {index: 0}},
	    	{x: 230, y: 180, duration: 300, line: 1, word: {index: 1}},
	    	{x: 300, y: 170, duration: 300, line: 1, word: {index: 2}},
	    	{x: 270, y: 130, duration: 300, line: 0, word: {index: 2}},
	    	{x: 350, y: 175, duration: 300, line: 1, word: {index: 3}},
	    ];

	    regressionMarker( fixations );

		assert.equal( fixations.reduce( (sum, fixation) => (sum + fixation.isRegression ? 1 : 0 ), 0), 1, 'here only 1 regression exists' );
	});
});

