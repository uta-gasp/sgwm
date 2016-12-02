const regression = require('./regression.js');
const logger = require('./logger.js').Logger;

const shortFixationFilter = require('./shortFixationFilter');

class SGWM {
	constructor() {
	}

	// Arguments:
	//	data ({fixations, words})
    map( data ) {
        if (!data.fixations || !data.words) {
            return;
        }

    	data.fixations = farFixationFilter( data.fixations );
    	data.fixations = shortFixationFilter( data.fixations );
    }
}

module.exports = SGWM;