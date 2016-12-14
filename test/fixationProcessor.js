const assert = require('chai').assert;

const FixationProcessor = require('./../src/fixationProcessor');
const FixationProcessorSettings = require('./../src/fixationProcessorSettings');

describe( 'fixationProcessor', () => {
	const textbox = {
		left: 200,
		right: 1000,
		top: 200,
		bottom: 600
	};

    before(() => {
    	const settings = new FixationProcessorSettings();

    	settings.location.enabled = true;
    	settings.location.marginX = 100;
    	settings.location.marginY = 150;

    	settings.duration.enabled = true;
    	settings.duration.mergingDistanceThreshold = 40;
    	settings.duration.mergingDurationThreshold = 150;
    	settings.duration.removingDurationThreshold = 150;

    	settings.save();
    });

    after(() => {
        localStorage.clear();
    });

	describe( '#filterByLocation', () => {
		it( 'should not remove anything', () =>  {
		    const input = [
		    	{x: 150, y: 100, duration: 300},
		    	{x: 300, y: 300, duration: 350},
		    	{x: 1050, y: 700, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByLocation( fixations, textbox );
		    assert.deepEqual( output, input, 'input and output fixations do not match' )
		});

		it( 'should remove first', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 100},
		    	{x: 300, y: 300, duration: 350},
		    	{x: 1050, y: 700, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByLocation( fixations, textbox );

		    assert.equal( output.length, input.length - 1, 'length was not decreased by 1' );
		    assert.deepEqual( output[0], input[1], 'input.1 !== output.0' );
		    assert.deepEqual( output[1], input[2], 'input.2 !== output.1' );
		});

		it( 'should remove the last', () =>  {
		    const input = [
		    	{x: 300, y: 300, duration: 350},
		    	{x: 1050, y: 700, duration: 400},
		    	{x: 1000, y: 1000, duration: 100},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByLocation( fixations, textbox );

		    assert.equal( output.length, input.length - 1, 'length was not decreased by 1' );
		    assert.deepEqual( output[0], input[0], 'input.0 !== output.0' );
		    assert.deepEqual( output[1], input[1], 'input.1 !== output.1' );
		});
	});

	describe( '#filterByDuration', () => {
		it( 'should not remove anything', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 300},
		    	{x: 100, y: 130, duration: 350},
		    	{x: 200, y: 100, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.deepEqual( input, output, 'inout and output should not differ' )
		});

		it( 'should join the first to the second', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 100},
		    	{x: 100, y: 130, duration: 300},
		    	{x: 200, y: 100, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.equal( output.length, input.length - 1, 'output should be 1 less than input' );
		    assert.equal( output[0].duration, input[0].duration + input[1].duration, 'duration of the first output fixation should be the sum of durations of the first and second input fixations' );
		    assert.deepEqual( output[1], input[2], 'input.2 !== output.1' );
		});

		it( 'should remove first', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 100},
		    	{x: 100, y: 200, duration: 300},
		    	{x: 200, y: 100, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.equal( output.length, input.length - 1, 'output should be 1 less than input' );
		    assert.deepEqual( output[0], input[1], 'input.1 !== output.0' );
		    assert.deepEqual( output[1], input[2], 'input.2 !== output.1' );
		});

		it( 'should join second to the third', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 300},
		    	{x: 170, y: 100, duration: 100},
		    	{x: 200, y: 100, duration: 400},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.equal( output.length, input.length - 1, 'output should be 1 less than input' );
		    assert.isAbove( output[1].x, (input[1].x + input[2].x) / 2, 'location of the second output fixations should be closer to the third input fixation than to the second one' );
		    assert.equal( output[1].duration, input[1].duration + input[2].duration, 'duration of the second output fixation should be the sum of durations of the second and third input fixations' );
		    assert.deepEqual( output[0], input[0], 'input.0 !== output.0' );
		});

		it( 'should join third to the second', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 300},
		    	{x: 170, y: 100, duration: 400},
		    	{x: 200, y: 100, duration: 100},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.equal( output.length, input.length - 1, 'output should be 1 less than input' );
		    assert.isBelow( output[1].x, (input[1].x + input[2].x) / 2, 'location of the second output fixations should be closer to the second input fixation than to the third one' );
		    assert.equal( output[1].duration, input[1].duration + input[2].duration, 'duration of the second output fixation should be the sum of durations of the second and third input fixations' );
		    assert.deepEqual( output[0], input[0], 'input.0 !== output.0' );
		});

		it( 'should remove the last', () =>  {
		    const input = [
		    	{x: 100, y: 100, duration: 400},
		    	{x: 130, y: 100, duration: 300},
		    	{x: 200, y: 100, duration: 100},
		    ];

			const fixations = input.map( (fixation, i) => Object.assign( { }, fixation ) );
			const fixationProcessor = new FixationProcessor();
		    const output = fixationProcessor.filterByDuration( fixations );

		    assert.equal( output.length, input.length - 1, 'output should be 1 less than input' );
		    assert.deepEqual( output[0], input[0], 'input.0 !== output.0' );
		    assert.deepEqual( output[1], input[1], 'input.1 !== output.1' );
		});
	});
});
