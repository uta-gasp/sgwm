/*
    Merges progressive reading fixations within the text lines
*/
'use strict';

const regression = require('./regression.js');
const ProgressionMergerSettings = require('./progressionMergerSettings');

const settings = new ProgressionMergerSettings();

const SET_TYPE = {
    LONG: 1,
    SHORT: 2,
    ANY: 3
};

let log = () => {}; // Function( module, ...messages )

class ProgressionMerger {
    // Arguments:
    //   interlineDistance (Number): inter-line distance in pixels
    //   logger ({ log(...) }): optional logger
    constructor( interlineDistance, logger ) {
        settings.load();
        settings.fitThreshold *= interlineDistance;

        this._interlineDistance = interlineDistance;

        if (logger) {
            logger.log( '. . . . . . . . .' );
            log = (...params) => {
                logger.log( 'ProgressionMerger   ', ...params );
            };
        }

        this.debug = {
            joinSetsOfType: joinSetsOfType,
            createPairs: createPairs,
            findAndJoinClosestPair: findAndJoinClosestPair,
        };
    }

    // Arguments:
    //   progressions (Array of (Array of Fixation))
    //   lineCount (Integer): number of text lines
    // Returns:
    //   new sorted array of original and merged progressions (Array of (Array of Fixation))
    // Notes:
    //   1. Fixations get property "line", the index of line they land onto.
    //   2. Merged sets have property "joined" = <number of joined progressions>
    //   3. Progressions not included in the resulting array and not merged with other have property "removed"
    merge( progressions, lineCount ) {
        let result = progressions.map( set => set );
        log( '#0:', result.length, '\n', result.map( set => (set.map( fix => fix.id ))) );

        // 1. join only long sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, SET_TYPE.LONG, settings.minLongSetLength );
        log( '#1a:', result.length );

        // 2. join short sets with long sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT, SET_TYPE.LONG, settings.minLongSetLength );
        log( '#1b:', result.length );

        // 3. join the remaining single-fixation sets with multi-fixation sets
        const multiFixationSetLength = 2;
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT, SET_TYPE.LONG, multiFixationSetLength );
        log( '#1c:', result.length );

        if (result.length > lineCount) {
            // still too many: join any multi-fixation set with any other multi-fixation set
            result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, SET_TYPE.LONG, multiFixationSetLength );
            log( '#2:', result.length );
        }
        else if (settings.removeSingleFixationLines) {
            result = dropShortSets( result, 2 );
        }

        if (result.length > lineCount) {
            // and still too many...
            // drop short sets
            result = dropShortSets( result, settings.minLongSetLength );
            log( '#3a:', result.length );

            // then force joining the closest sets
            result = joinSetsOfType( result, lineCount, SET_TYPE.ANY, SET_TYPE.ANY );
            log( '#3b:', result.length );
        }

        align( result, this._interlineDistance );

        return result;
    }
}

function joinSetsOfType( fixationsSets, lineCount, primarySetType, secondarySetType, minLongSetLength ) {
    let result = fixationsSets;
    const forced = primarySetType === SET_TYPE.ANY && secondarySetType === SET_TYPE.ANY;

    while (result.length > lineCount) {
        const pairs = createPairs( result, primarySetType, secondarySetType, minLongSetLength );
        const updatedSets = findAndJoinClosestPair( result, pairs, forced );

        if (!updatedSets) {
            break;
        }

        result = updatedSets;
    }

    return result;
}

/**********************
    createPairs
**********************/

function isValidSet( set, lengthType, lengthTypeThreshold) {
    if (lengthType === SET_TYPE.LONG && set.length < lengthTypeThreshold) {
        return false;
    }
    else if (lengthType === SET_TYPE.SHORT && set.length >= lengthTypeThreshold) {
        return false;
    }
    return true;
}

// function getFittingError( fixations, model ) {
//     let error = 0;

//     for (let i = 0; i < fixations.length; i += 1) {
//         const fixation = fixations[i];
//         const y = regression.fit( model, fixation.x );
//         error += (fixation.y - y) * (fixation.y - y);
//     }

//     return Math.sqrt( error / fixations.length );
// }

function fixationsToArray( fixations ) {
    const result = [];
    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        result.push([ fixation.x, fixation.y ]);
    }
    return result;
}

function getFitError( fixations ) {
    const model = regression.model( 'linear', fixationsToArray( fixations ) );

    let error = 0;

    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        const y = regression.fit( model.equation, fixation.x );
        error += (fixation.y - y) * (fixation.y - y);
    }

    return Math.sqrt( error / fixations.length );
}

function createPairs( fixationsSets, primarySetType, secondarySetType, setSetTypeThreshold) {
    const pairs = [];

    for (let i = 0; i < fixationsSets.length; i += 1) {
        const set1 = fixationsSets[i];
        if (!isValidSet( set1, primarySetType, setSetTypeThreshold )) {
            continue;
        }

        // Compute error of fitting to linear model for each pair of sets
        for (let j = 0; j < fixationsSets.length; j += 1) {
            if (i === j) {
                continue;
            }

            const set2 = fixationsSets[j];
            if (!isValidSet( set2, secondarySetType, setSetTypeThreshold )) {
                continue;
            }

            const joinedSets = set1.concat( set2 );

            pairs.push({
                set1: i,
                set2: j,
                error: getFitError( joinedSets )
            });
        }
    }

    return pairs;
}

/**********************
    findAndJoinClosestPair
**********************/

function joinSets( fixationsSets, id1, id2, forced ) {
    const maxGradient = forced ? Number.MAX_VALUE : settings.maxLinearGradient;

    const set1 = fixationsSets[ id1 ];
    const set2 = fixationsSets[ id2 ];
    const joinedSet = set1.concat( set2 );
    joinedSet.joined = (set1.joined || 1) + (set2.joined || 1);

    const model = regression.model( 'linear', fixationsToArray( joinedSet ) );
    const gradient = model.equation[1];

    if (Math.abs( gradient ) < maxGradient) {
        const minIndex = Math.min( id1, id2 );
        const maxIndex = Math.max( id1, id2 );

        fixationsSets.splice( maxIndex, 1 );
        fixationsSets.splice( minIndex, 1 );
        fixationsSets.push( joinedSet );

        log( 'joined', id1 + ' = ' + set1.map( fix => fix.id), ' & ', id2 + ' = ' + set2.map( fix => fix.id) );
        log( '--->\n', fixationsSets.map( set => set.map( fix => fix.id ) ) );
        return true;
    }

    return false;
}

function findAndJoinClosestPair( fixationsSets, pairs, forced ) {
    let result;

    const fitThreshold = forced ? Number.MAX_VALUE : settings.fitThreshold;

    // holds pairs that produce too inclined set
    const invalidPairs = {};

    do {
        // find 2 nearest sets, i.e. the pair with smallest error
        let minError = Number.MAX_VALUE;
        let minIndex = -1;
        for (let i = 0; i < pairs.length; i += 1) {
            if (invalidPairs[i]) {
                continue;
            }
            const pair = pairs[i];
            if (pair.error < minError) {
                minIndex = i;
                minError = pair.error;
            }
        }

        // if found, try to join them
        if (minIndex >= 0 && minError < fitThreshold) {
            const pair = pairs[ minIndex ];
            const success = joinSets( fixationsSets, pair.set1, pair.set2, forced );
            if (success) {
                result = fixationsSets;
            }
            else {
                invalidPairs[ minIndex ] = true;
            }
        }
        else {
            result = null;
        }

        // break only when
        //  - all pairs have too distant components, or
        //  - all pairs have very distinctly inclined set of fixations, or
        //  - a pair of the closest sets was joined
    } while (result === undefined);

    return result;
}

/**********************
    align
**********************/
function sortLines( fixationLines ) {
    fixationLines.sort( (line1, line2) => {
        return avgY( line1 ) - avgY( line2 );
    });
    fixationLines.forEach( line => {
        line.sort( (fix1, fix2) => {
            return fix1.ts - fix2.ts;
        });
    });
}

function align( fixationLines, interlineDistance ) {

    sortLines( fixationLines );

    let currentLineID = 0;
    let lastLineY = 0;

    const minYDiffForLineCorrection = settings.emptyLineDetectorFactor * interlineDistance;

    for (let i = 0; i < fixationLines.length; i += 1) {
        const fixations = fixationLines[i];
        let currentLineY = 0;
        for (let j = 0; j < fixations.length; j += 1) {
            currentLineY += fixations[j].y;
        }

        currentLineY /= fixations.length;

        if (settings.correctForEmptyLines && i > 0 && (currentLineY - lastLineY) > minYDiffForLineCorrection) {
            const origLineID = currentLineID;
            currentLineID += Math.round( (currentLineY - lastLineY) / interlineDistance ) - 1;
            log( `Correction: #${origLineID} => ${currentLineID}` );
        }

        for (let j = 0; j < fixations.length; j += 1) {
            fixations[j].line = currentLineID;
        }

        lastLineY = currentLineY;
        currentLineID += 1;
    }
}

/**********************
    [other]
**********************/

function dropShortSets( fixationSets, minLength ) {
    var result = [];

    for (var i = 0; i < fixationSets.length; i += 1) {
        var fixationSet = fixationSets[i];
        if (fixationSet.length >= minLength) {
            result.push( fixationSet );
        }
        else {
            fixationSet.removed = true;
        }
    }

    return result;
}

function avgY( fixations ) {
    let sumY = 0;
    for (var i = 0; i < fixations.length; i += 1) {
        sumY += fixations[i].y;
    }
    return sumY / fixations.length;
}

module.exports = ProgressionMerger;