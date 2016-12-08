const assert = require('chai').assert;

const Text = require('./../src/text');
const WordMapper = require('./../src/wordMapper');
const WordMapperSettings = require('./../src/wordMapperSettings');

function Word( x, y, w, h, text, expectedFixations ) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.text = text;
	this.expectedFixations = expectedFixations;
}

describe( 'WordMapper', () => {
	const logger = {
		logs: [],
		name: 'WordMapper',
		log: function( ...messages ) {
			this.logs.push( messages );
		},
		print: function() {
	    	console.log( `==== ${this.name} =====` );
	    	this.logs.forEach( log => {
	    		console.log( ...log );
	    	})
	    	console.log( '=========' );
		}
	};

    before(() => {
    	const settings = new WordMapperSettings();
    	settings.wordCharSkipStart = 3;
    	settings.wordCharSkipEnd = 6;
    	settings.scalingDiffLimit = 0.9;
    	settings.rescaleFixationX = true;
    	settings.partialLengthMaxWordLength = 2;
    	settings.effectiveLengthFactor = 0.7;
    	settings.save();
    });

    after(() => {
    	logger.print();
    });

	it( 'should correctly map fixations to words', () =>  {
		const words = [
			new Word(100, 100, 90, 20, 'aaaaaa', 1),
			new Word(200, 100, 90, 20, 'bbbbbb', 2),
			new Word(300, 100, 90, 20, 'cccccc', 1),
			new Word(100, 140, 90, 20, 'dddddd', 1),
			new Word(200, 140, 90, 20, 'eeeeee', 1),
			new Word(300, 140, 110, 20, 'ffffffff', 2),
			new Word(100, 180, 90, 20, 'gggggg', 1),
			new Word(200, 180, 90, 20, 'hhhhhh', 1),
			new Word(300, 180, 90, 20, 'iiiiii', 2),
		];
		const fixations = [
		    [
		    	{x: 150, y: 100, duration: 300, line: 0},
		    	{x: 200, y: 120, duration: 350, line: 0},
		    	{x: 250, y: 110, duration: 400, line: 0},
		    	{x: 350, y: 125, duration: 400, line: 0},
		    ],
		    [
		    	{x: 140, y: 145, duration: 300, line: 1},
		    	{x: 230, y: 150, duration: 300, line: 1},
		    	{x: 300, y: 140, duration: 300, line: 1},
		    	{x: 350, y: 145, duration: 300, line: 1},
		    ],
		    [
		    	{x: 170, y: 190, duration: 300, line: 2},
		    	{x: 230, y: 185, duration: 300, line: 2},
		    	{x: 300, y: 195, duration: 300, line: 2},
		    	{x: 350, y: 200, duration: 300, line: 2},
		    ],
	    ];

		const text = new Text( words );
	    const wordMapper = new WordMapper( logger );
	    wordMapper.map( fixations, text.lines );

		assert.ok( fixations.every( line => line.every( fixation => !!fixation.word ) ), 'each fixation should be mapped onto a word' );
		assert.ok( text.lines.every( line => line.every( word => word.fixations.length === word.expectedFixations ), 'each word should match the number pf the expected fixations mapped onto it' ) );
	});
});

