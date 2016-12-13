/*
    Main class (and entry point), unites all the fuctionality
*/
'use strict';

const farFixationFilter = require('./farFixationFilter');
const shortFixationFilter = require('./shortFixationFilter');
const splitToProgressions = require('./splitToProgressions');
const TextModel = require('./textModel');
const ProgressionMerger = require('./progressionMerger');
const WordMapper = require('./wordMapper');

const FarFixationFilterSettings = require('./farFixationFilterSettings');
const ProgressionMergerSettings = require('./progressionMergerSettings');
const ShortFixationFilterSettings = require('./shortFixationFilterSettings');
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

        for (let i = 0; i < fixations.length; i += 1) {
	        fixations[i].id = i;
        }

    	fixations = farFixationFilter( fixations );
    	fixations = shortFixationFilter( fixations );

    	const text = new TextModel( data.words );

    	const progressions = splitToProgressions( fixations, text.lineHeight, text.interlineDistance );

		const merger = new ProgressionMerger( text.interlineDistance, this.logger );
    	const fixationLines = merger.merge( progressions, text.lines.length );

	    const wordMapper = new WordMapper( this.logger );
	    wordMapper.map( fixationLines, text.lines );
	    wordMapper.clean( fixations, text.words );

    	return { fixations, text };
    }

    static get FarFixationFilterSettings() { return FarFixationFilterSettings; }
    static get ProgressionMergerSettings() { return ProgressionMergerSettings; }
    static get ShortFixationFilterSettings() { return ShortFixationFilterSettings; }
    static get SplitToProgressionsSettings() { return SplitToProgressionsSettings; }
    static get WordMapperSettings() { return WordMapperSettings; }
}

module.exports = SGWM;