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
    a.merged = true;
};

// Cycle al fixations and joins or deletes too short
const joinOrDeleteShortFixations = (fixations) => {
    const result = [];

    let prevFix, prevPrevFix;
    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        if (prevFix && prevFix.duration < settings.mergingDurationThreshold ) {
            const distToPrev = prevPrevFix ? dist( prevFix, prevPrevFix ) : Number.MAX_VALUE;
            const distToNext = dist( prevFix, fixation );
            if (distToPrev < settings.mergingDistanceThreshold || distToNext < settings.mergingDistanceThreshold) {
                if (distToNext < distToPrev) {
                    join( fixation, prevFix );
                }
                else {
                    join( prevPrevFix, prevFix );
                }
                result.pop();
                prevFix = prevPrevFix;
            }
            else if (prevFix.duration < settings.removingDurationThreshold) {
                result.pop();
                prevFix = prevPrevFix;
            }
        }

        result.push( fixation );

        prevPrevFix = prevFix;
        prevFix = fixation;
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
