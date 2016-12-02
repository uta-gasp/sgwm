const regression = require('./regression.js');
const logger = require('./logger.js').Logger;

const shortFixationFilter = require('./shortFixationFilter');

class SGWM {
	constructor() {
	}

	// Arguments:
	//	data ({fixations, words})
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

    	data.fixations = fixations;
    }
}

module.exports = SGWM;