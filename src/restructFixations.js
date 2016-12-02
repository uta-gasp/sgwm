/*
	Resturctures a list of fixations by merging close short fixatins or remove them
	Arguments:
		- fixations (Array of Fixation)
*/
const FixationsRestructuringSettings = require('./fixationsRestructuringSettings');

const settings = new FixationsRestructuringSettings();

// Calculated distance between 2 fixations
const dist = (a, b) => Math.sqrt( Math.pow( a.x - b.x, 2 ) + Math.pow( a.y - b.y, 2 ) );

// Joins 2 fixations, saves the result to the first fixation and sets its "merged" field to "true"
const join = (a, b) => {
    const totalDuration = a.duration + b.duration;
    a.x = (a.x * a.duration + b.x * b.duration) / totalDuration;
    a.y = (a.y * a.duration + b.y * b.duration) / totalDuration;
    a.duration = totalDuration;
    a.merged = (a.merged || 1) + (b.merged || 1);
    return a;
};

// Tries to join or remove the previous fixation
// Arguments:
//		prev (Fixation)
//		fixation (Fixation)
//		next (Fixation)
// Returns
//		true if the fixation was joined or should be removed
const joinOrDeleteShortFixation = (fixation, prev, next) => {
    const distToPrev = prev ? dist( fixation, prev ) : Number.MAX_VALUE;
    const distToNext = next ? dist( fixation, next ) : Number.MAX_VALUE;
    if (distToPrev < settings.mergingDistanceThreshold || distToNext < settings.mergingDistanceThreshold) {
        if (distToNext < distToPrev) {
            join( next, fixation );
        }
        else {
            join( prev, fixation );
        }
        return true;
    }
    else if (fixation.duration < settings.removingDurationThreshold) {
        return true;
    }

    return false;
}

// Cycle all fixations and joins or deletes too short
// Returns
//		array of newly created objects
const joinOrDeleteShortFixations = (fixations) => {
    const result = [];

    let prevFix, prevPrevFix;
    for (let i = 0; i < fixations.length; i += 1) {
        let fixation = Object.assign( {}, fixations[i] );

        if (prevFix && prevFix.duration < settings.mergingDurationThreshold ) {
        	if (joinOrDeleteShortFixation( prevFix, prevPrevFix, fixation )) {
		        result.pop();
		        prevFix = prevPrevFix;
        	}
        }

        result.push( fixation );

        prevPrevFix = prevFix;
        prevFix = fixation;
    }

	if (prevFix.duration < settings.mergingDurationThreshold &&
			joinOrDeleteShortFixation( prevFix, prevPrevFix, null )) {
		result.pop();
	}

    return result;
};

// Arguments:
//	 fixations (Array of {x, y, duration})
// Returns
//	 array of same fixations, but some are dropped and some are modified
//	 (the modified are marked with "merged")
module.exports = function( fixations ) {
	settings.load();
	if (!settings.enabled) {
		return fixations;
	}

    let fixationCount;
    let result = fixations;

    do {
        fixationCount = result.length;
        result = joinOrDeleteShortFixations( result );
    } while (result.length !== fixationCount);

    return result;
};
