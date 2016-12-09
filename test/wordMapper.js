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

	describe( '#map', () => {
		it( 'should correctly map fixations to words', () =>  {
			logger.log('\n');
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

	describe( '#clean', () => {
		it( 'should remove 1 mapping as the transition', () =>  {
			logger.log('\n');
			const words = [
				new Word(100, 100, 90, 20, 'aaaaaa' ),
				new Word(200, 100, 90, 20, 'bbbbbb' ),
				new Word(300, 100, 90, 20, 'cccccc' ),
				new Word(100, 155, 90, 20, 'dddddd' ),
				new Word(200, 155, 90, 20, 'eeeeee' ),
				new Word(300, 155, 110, 20, 'ffffffff' ),
				new Word(420, 155, 100, 20, 'ggggggg' ),
				new Word(100, 210, 90, 20, 'hhhhhh' ),
				new Word(200, 210, 90, 20, 'iiiiii' ),
				new Word(300, 210, 90, 20, 'jjjjjj' ),
			];
			const text = new Text( words );

			const fixations = [
		    	{x: 150, y: 100, duration: 300, line: 0, word: text.words[0] },
		    	{x: 200, y: 120, duration: 350, line: 0, word: text.words[1] },
		    	{x: 250, y: 110, duration: 400, line: 0, word: text.words[1] },
		    	{x: 170, y: 120, duration: 300, line: 0, word: text.words[0] },
		    	{x: 230, y: 110, duration: 300, line: 0, word: text.words[1] },
		    	{x: 300, y: 120, duration: 300, line: 0, word: text.words[2] },
		    	{x: 350, y: 110, duration: 300, line: 0, word: text.words[2] },
		    	{x: 200, y: 130, duration: 300, line: 0, word: text.words[1] },
		    	{x: 140, y: 175, duration: 300, line: 1, word: text.words[3] },
		    	{x: 230, y: 180, duration: 300, line: 1, word: text.words[4] },
		    	{x: 300, y: 170, duration: 300, line: 1, word: text.words[5] },
		    	{x: 270, y: 130, duration: 300, line: 0, word: text.words[2] },
		    	{x: 350, y: 175, duration: 300, line: 1, word: text.words[6] },
		    	{x: 160, y: 220, duration: 300, line: 2, word: text.words[7] },
		    	{x: 330, y: 220, duration: 300, line: 2, word: text.words[9] },
		    	{x: 230, y: 200, duration: 300, line: 2, word: text.words[8] },
		    	{x: 130, y: 170, duration: 300, line: 1, word: text.words[3] },
		    ];
		    fixations.forEach( (fix, i) => { fix.id = i; });

			text.words[0].fixations = [ fixations[0], fixations[3] ];
			text.words[1].fixations = [ fixations[1], fixations[2], fixations[4], fixations[7] ];
			text.words[2].fixations = [ fixations[5], fixations[6] ];
			text.words[3].fixations = [ fixations[8], fixations[16], fixations[11] ];
			text.words[4].fixations = [ fixations[9] ];
			text.words[5].fixations = [ fixations[10] ];
			text.words[6].fixations = [ fixations[12] ];
			text.words[7].fixations = [ fixations[13] ];
			text.words[8].fixations = [ fixations[15] ];
			text.words[9].fixations = [ fixations[14] ];

		    const wordMapper = new WordMapper( logger );
		    wordMapper.clean( fixations, text.words );

			assert.isUndefined( fixations[7].word, '#7 should have no words mapped' );
			assert.isUndefined( fixations[15].word, '#15 should have no words mapped' );

			assert.equal( text.words[1].fixations.length, 3, 'should have one fixation less' );
			assert.isUndefined( text.words[8].fixations, 'should have no fixations' );
		});
	});
});

