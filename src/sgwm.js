/*
    Main class (and entry point), unites all the fuctionality
*/
'use strict';

const FixationProcessor = require('./fixationProcessor');
const splitToProgressions = require('./splitToProgressions');
const TextModel = require('./textModel');
const ProgressionMerger = require('./progressionMerger');
const WordMapper = require('./wordMapper');

const FixationProcessorSettings = require('./fixationProcessorSettings');
const ProgressionMergerSettings = require('./progressionMergerSettings');
const SplitToProgressionsSettings = require('./splitToProgressionsSettings');
const WordMapperSettings = require('./wordMapperSettings');

class SGWM {
	constructor( logger ) {
        this.logger = logger;
	}

	// Arguments:
	//	data ({
	//		fixations (Array of Fixations)
    //          Fixation = {ts, x, y, duration}
	//		words (Aarray of Word)
    //          Word = {x, y, width, height, text, row:optional=<line ID starting form 1>}
	//	})
    map( data ) {
        let fixations = data.fixations;
        const words = data.words;

        if (!fixations || !words) {
            return;
        }

        const text = new TextModel( data.words );

        fixations = fixations.map( (fixation, i) => Object.assign( { id: i }, fixation ) );

        const fixationProcessor = new FixationProcessor( this.logger );
    	fixations = fixationProcessor.filterByLocation( fixations, text.box );
    	fixations = fixationProcessor.filterByDuration( fixations );

    	const progressions = splitToProgressions( fixations, text.lineHeight, text.interlineDistance );

		const merger = new ProgressionMerger( text.interlineDistance, this.logger );
    	const fixationLines = merger.merge( progressions, text.lines );

	    const wordMapper = new WordMapper( this.logger );
	    wordMapper.map( fixationLines, text.lines );
	    wordMapper.clean( fixations, text.words );

    	return { fixations, text };
    }

    static get FixationProcessorSettings() { return FixationProcessorSettings; }
    static get ProgressionMergerSettings() { return ProgressionMergerSettings; }
    static get SplitToProgressionsSettings() { return SplitToProgressionsSettings; }
    static get WordMapperSettings() { return WordMapperSettings; }
}

module.exports = SGWM;