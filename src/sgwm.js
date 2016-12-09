const regression = require('./regression.js');
const logger = require('./logger.js').Logger;

const farFixationFilter = require('./farFixationFilter');
const shortFixationFilter = require('./shortFixationFilter');
const splitToProgressions = require('./splitToProgressions');
const Text = require('./text');
const ProgressionMerger = require('./progressionMerger');
const fixationAligner = require('./fixationAligner');
const WordMapper = require('./wordMapper');

class SGWM {
	constructor() {
	}

	// Arguments:
	//	data ({
	//		fixations: Array of {x, y, duration},
	//		words: Aarray of {}
	//	})
    map( data ) {
        let fixations = data.fixations;
        const words = data.words;

        if (!fixations || !words) {
            return;
        }

        for (let i = 0; i < fixations.length; i += 1) {
	        fixation.id = i;
        }

    	fixations = farFixationFilter( fixations );
    	fixations = shortFixationFilter( fixations );

    	const text = new Text( data.words );

    	const progressions = splitToProgressions( fixations, text.lineHeight );

		const merger = new ProgressionMerger( text.interlineDistance );
    	const fixationLines = merger.merge( progressions );
    	merger.align( fixationLines, text.lines );

    	fixationAligner( fixationLines, text.lines );

	    const wordMapper = new WordMapper();
	    wordMapper.map( fixationLines, text.lines );
	    wordMapper.clean( fixations, text.words );

    	data.fixations = fixations;
    }
}

module.exports = SGWM;