const assert = require('chai').assert;

const SGWM = require('./../src/sgwm');

const FarFixationFilterSettings = require('./../src/farFixationFilterSettings');
const ProgressionMergerSettings = require('./../src/progressionMergerSettings');
const ShortFixationFilterSettings = require('./../src/shortFixationFilterSettings');
const SplitToProgressionsSettings = require('./../src/splitToProgressionsSettings');
const WordMapperSettings = require('./../src/wordMapperSettings');

function Word( x, y, w, h, text ) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.text = text;
}

describe( 'SGWM', () => {
	const logger = {
		logs: [],
		name: 'SGWM',
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
    	let settings = new FarFixationFilterSettings();
    	settings.enabled = true;
    	settings.marginX = 100;
    	settings.marginY = 150;
    	settings.save();

    	settings = new ProgressionMergerSettings();
    	settings.minLongSetLength = 3;
    	settings.fitThreshold = 0.3;		// fraction of te interline distance
    	settings.maxLinearGradient = 0.15;
    	settings.removeSingleFixationLines = false;
    	settings.correctForEmptyLines = true;
    	settings.emptyLineDetectorFactor = 1.7;
    	settings.save();

    	settings = new ShortFixationFilterSettings();
    	settings.enabled = true;
    	settings.mergingDistanceThreshold = 40;
    	settings.mergingDurationThreshold = 150;
    	settings.removingDurationThreshold = 150;
    	settings.save();

    	settings = new SplitToProgressionsSettings();
    	settings.bounds = {	// in size of char height
			left: -2,
			right: 20,
			verticalChar: 2,
			verticalLine: 0.4
		};
    	settings.angle = Math.sin( 10 * Math.PI / 180 );
    	settings.save();

    	settings = new WordMapperSettings();
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
		logger.log('\n');
		const words = [
			new Word(100, 100, 90, 18, 'aaaaaa' ),
			new Word(200, 100, 90, 18, 'bbbbbb' ),
			new Word(300, 100, 90, 18, 'cccccc' ),
			new Word(100, 155, 90, 18, 'dddddd' ),
			new Word(200, 155, 90, 18, 'eeeeee' ),
			new Word(300, 155, 110, 18, 'ffffffff' ),
			new Word(420, 155, 100, 18, 'ggggggg' ),
			new Word(100, 210, 90, 18, 'hhhhhh' ),
			new Word(200, 210, 90, 18, 'iiiiii' ),
			new Word(300, 210, 90, 18, 'jjjjjj' ),
		];
		const fixes = [
	    	{ts: 10000, x: 150, y: 100, duration: 300 },
	    	{ts: 10400, x: 200, y: 120, duration: 350 },
	    	{ts: 10800, x: 250, y: 110, duration: 400 },
	    	{ts: 11250, x: 170, y: 120, duration: 300 },
	    	{ts: 11600, x: 230, y: 110, duration: 300 },
	    	{ts: 12000, x: 300, y: 120, duration: 300 },
	    	{ts: 12400, x: 350, y: 110, duration: 300 },
	    	{ts: 12800, x: 200, y: 130, duration: 300 },	// #7 transition
	    	{ts: 13200, x: 140, y: 175, duration: 300 },
	    	{ts: 13600, x: 230, y: 180, duration: 300 },
	    	{ts: 14000, x: 300, y: 170, duration: 300 },
	    	{ts: 14400, x: 270, y: 130, duration: 300 },
	    	{ts: 14800, x: 350, y: 175, duration: 300 },
	    	{ts: 15200, x: 160, y: 220, duration: 300 },
	    	{ts: 15600, x: 330, y: 220, duration: 300 },
	    	{ts: 16000, x: 230, y: 200, duration: 300 },	// #15 transition
	    	{ts: 16400, x: 130, y: 170, duration: 300 },
	    ];

	    const mapper = new SGWM( logger );
	    const { fixations, text } = mapper.map( { fixations: fixes, words: words } );

		assert.equal( 8, fixations.reduce( (sum, fix) => (sum + (fix.line === 0 ? 1 : 0) ), 0) );
		assert.equal( 5, fixations.reduce( (sum, fix) => (sum + (fix.line === 1 ? 1 : 0) ), 0) );
		assert.equal( 2, fixations.reduce( (sum, fix) => (sum + (fix.line === 2 ? 1 : 0) ), 0) );
	});
});

