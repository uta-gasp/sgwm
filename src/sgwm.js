const regression = require('./regression.js');

const farFixationFilter = require('./farFixationFilter');
const shortFixationFilter = require('./shortFixationFilter');
const splitToProgressions = require('./splitToProgressions');
const Text = require('./text');
const ProgressionMerger = require('./progressionMerger');
const WordMapper = require('./wordMapper');

let logger;

class SGWM {
	constructor( logger_ ) {
        if (logger_) {
            logger = logger_;
        }
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

    	const text = new Text( data.words );

    	const progressions = splitToProgressions( fixations, text.lineHeight, text.interlineDistance );

		const merger = new ProgressionMerger( text.interlineDistance, logger );
    	const fixationLines = merger.merge( progressions, text.lines.length );

	    const wordMapper = new WordMapper( logger );
	    wordMapper.map( fixationLines, text.lines );
	    wordMapper.clean( fixations, text.words );

    	return { fixations, text };
    }
}

module.exports = SGWM;