/*
    Reprocesses or filter out fixatins based on their properties
*/
'use strict';

const FixationProcessorSettings = require('./fixationProcessorSettings');

const settings = new FixationProcessorSettings();

let log = () => {}; // Function( module, ...messages )

class FixationProcessor {
    // Arguments:
    //   logger ({ log(...) }): optional logger
    constructor( logger ) {
        settings.load();

        if (logger) {
            logger.log( '. . . . . . . . .' );
            log = (...params) => {
                logger.log( 'FixationProcessor   ', ...params );
            };
        }
    }

    // Arguments
    //   fixations (Array of Fixation)
    //   textbox {left, right, top, bottom}
    // Returns
    //   new array with original fixations (Array of Fixation)
    filterByLocation( fixations, textbox ) {
        if (!settings.location.enabled || !textbox) {
            return fixations;
        }

        const result = [];

        for (let i = 0; i < fixations.length; i += 1) {
            const fixation = fixations[i];
            if (fixation.x > textbox.left - settings.location.marginX &&
                    fixation.x < textbox.right + settings.location.marginX &&
                    fixation.y > textbox.top - settings.location.marginY &&
                    fixation.y < textbox.bottom + settings.location.marginY) {
                result.push( fixation );
            }
        }

        return result;
    }

    // Arguments:
    //   fixations (Array of Fixation)
    // Returns
    //   new array of fixations
    //   (the merged fixations have property "merged" = <number of merged fixations>)
    filterByDuration( fixations ) {
        if (!settings.duration.enabled) {
            return fixations;
        }

        let fixationCount;
        let result = fixations;

        do {
            fixationCount = result.length;
            result = joinOrDeleteShortFixations( result );
        } while (result.length !== fixationCount);

        return result;
    }
}

// Calculated distance between 2 fixations
function dist( a, b ) {
    return Math.sqrt( Math.pow( a.x - b.x, 2 ) + Math.pow( a.y - b.y, 2 ) );
}

// Joins 2 fixations, saves the result to the first fixation,
// and adds property "merged" = <number of merged fixations>
function join( a, b ) {
    const totalDuration = a.duration + b.duration;
    a.x = (a.x * a.duration + b.x * b.duration) / totalDuration;
    a.y = (a.y * a.duration + b.y * b.duration) / totalDuration;
    a.duration = totalDuration;
    a.merged = (a.merged || 1) + (b.merged || 1);
    log( 'joined', b.id, 'to', a.id );
    return a;
}

// Tries to join the fixation
// Arguments:
//      fixation (Fixation)
//      prev (Fixation)
//      next (Fixation)
// Returns
//      true if the fixation was joined and the original instance should be removed
function tryJoinFixation( fixation, prev, next ) {
    const distToPrev = prev ? dist( fixation, prev ) : Number.MAX_VALUE;
    const distToNext = next ? dist( fixation, next ) : Number.MAX_VALUE;
    if (distToPrev < settings.duration.mergingDistanceThreshold || distToNext < settings.duration.mergingDistanceThreshold) {
        if (distToNext < distToPrev) {
            join( next, fixation );
        }
        else {
            join( prev, fixation );
        }
        return true;
    }
    else if (fixation.duration < settings.duration.removingDurationThreshold) {
        log( 'removed', fixation.id );
        return true;
    }

    return false;
}

// Cycle all fixations and joins or deletes too short
// Returns
//   new sequence of fixations (Array of Fixation)
function joinOrDeleteShortFixations( fixations ) {
    const result = [];

    let prevFix, prevPrevFix;
    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];

        if (prevFix && prevFix.duration < settings.duration.mergingDurationThreshold ) {
            if (tryJoinFixation( prevFix, prevPrevFix, fixation )) {
                result.pop();
                prevFix = prevPrevFix;
            }
        }

        result.push( fixation );

        prevPrevFix = prevFix;
        prevFix = fixation;
    }

    if (prevFix.duration < settings.duration.mergingDurationThreshold) {
        if (tryJoinFixation( prevFix, prevPrevFix, null )) {
          result.pop();
        }
    }

    return result;
}

module.exports = FixationProcessor;
