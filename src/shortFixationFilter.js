/*
	Filters out short fixatins by merging with other or just removing
*/

const ShortFixationFilterSettings = require('./shortFixationFilterSettings');

const settings = new ShortFixationFilterSettings();

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

// Tries to join the fixation
// Arguments:
//		fixation (Fixation)
//      prev (Fixation)
//		next (Fixation)
// Returns
//		true if the fixation should be removed
const tryJoinFixation = (fixation, prev, next) => {
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
//   array of newly created fixation objects (Array of Fixation)
// Notes:
//   not-modified fixations are copied
const joinOrDeleteShortFixations = (fixations) => {
    const result = [];

    let prevFix, prevPrevFix;
    for (let i = 0; i < fixations.length; i += 1) {
        let fixation = Object.assign( {}, fixations[i] );

        if (prevFix && prevFix.duration < settings.mergingDurationThreshold ) {
        	if (tryJoinFixation( prevFix, prevPrevFix, fixation )) {
		        result.pop();
		        prevFix = prevPrevFix;
        	}
        }

        result.push( fixation );

        prevPrevFix = prevFix;
        prevFix = fixation;
    }

	if (prevFix.duration < settings.mergingDurationThreshold) {
		if (tryJoinFixation( prevFix, prevPrevFix, null )) {
		  result.pop();
        }
	}

    return result;
};

// Arguments:
//	 fixations (Array of {x, y, duration})
// Returns
//	 new array of copied fixations if enabled, same array otherwise
//	 (the merged fixations have "merged = <countOfMergedFixations>")
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
