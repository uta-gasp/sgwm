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

let interlineDistance = 30;

let log = () => {}; // Function( module, ...messages )

class ProgressionMerger {
    // Arguments:
    //   interlineDistance (Number): inter-line distance in pixels
    //   logger ({ log(...) }): optional logger
    constructor( _interlineDistance, logger ) {
        interlineDistance = _interlineDistance;

        settings.load();
        settings.fitThreshold *= interlineDistance;

        if (logger) {
            logger.log( '. . . . . . . . .' );
            log = (...params) => {
                logger.log( 'ProgressionMerger   ', ...params );
            };
        }
    }

    // Arguments:
    //   progressions (Array of (Array of Fixation))
    //   textLines (Array of (Array of word))
    // Returns:
    //   new sorted array of original and merged progressions (Array of (Array of Fixation))
    // Notes:
    //   1. Fixations get property "line", the index of line they land onto.
    //   2. Merged sets have property "joined" = <number of joined progressions>
    //   3. Progressions not included in the resulting array and not merged with other have property "removed"
    merge( progressions, textLines ) {
        const lineCount = textLines.length;

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
        // }

        // if (result.length > lineCount) {
            // and still too many...
            // then force joining the closest sets
            result = joinSetsOfType( result, lineCount, SET_TYPE.ANY, SET_TYPE.ANY );
            log( '#3b:', result.length );
        }

        align( result, textLines );

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
function avgY( fixations ) {
    let sumY = 0;
    for (let i = 0; i < fixations.length; i += 1) {
        sumY += fixations[i].y;
    }
    return sumY / fixations.length;
}

function sortSets( fixationsSets ) {
    fixationsSets.sort( (set1, set2) => {
        return avgY( set1 ) - avgY( set2 );
    });
    fixationsSets.forEach( set => {
        set.sort( (fix1, fix2) => {
            return fix1.ts - fix2.ts;
        });
    });
}

function computeRange( set, getValue ) {
    if (!set) {
        return { min: 0, max: 0, range: 0 };
    }

    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    set.forEach( fixation => {
        const value = getValue( fixation );
        if (min > value) {
            min = value;
        }
        if (max < value) {
            max = value;
        }
    });

    return { min, max, range: max - min };
}

function getInitialLine( fixationsSets, textLines ) {
    if (!settings.intelligentFirstLineMapping || textLines.length < 2) {
        return 0;
    }

    const firstSetLength = computeRange( fixationsSets[0], fixation => fixation.x ).range;
    const lineLengths = [];
    textLines.forEach( line => {
        lineLengths.push( computeRange( line, word => word.x ).range + line[ line.length - 1 ].width );
    });

    let lineID = 0;

    let ratio = lineLengths[ lineID ] / firstSetLength;
    let threshold = lineLengths[ lineID ] / lineLengths[ lineID + 1 ];
    while (threshold < 0.7 && ratio < ((threshold + 1) / 2) && lineID <= lineLengths.length / 2 ) {
        lineID++;
        ratio = lineLengths[ lineID ] / firstSetLength;
        threshold = lineLengths[ lineID ] / lineLengths[ lineID + 1 ];
    }

    return lineID;
}

function align( fixationsSets, textLines ) {

    sortSets( fixationsSets );

    const { min: minID, max: maxID } = computeRange( textLines, line => line.id );

    let currentLineID = getInitialLine( fixationsSets, textLines );
    let lastSetY;
    // let lastLineY;

    for (let i = 0; i < fixationsSets.length; i += 1) {
        const fixations = fixationsSets[i];
        const currentSetY = avgY( fixations );
        // let currentLineY;

        const initialLineID = currentLineID;
        if (settings.correctForEmptyLines && i > 0) {
            /*
            while (currentLineID < textLines.length) {
                currentLineY = textLines[ currentLineID ].y;

                const setDist = currentSetY - lastSetY;
                const lineDist = currentLineY - lastLineY;

                if (setDist < settings.emptyLineDetectorFactor * lineDist) {
                    break;
                }

                currentLineID += 1;
            }
            */
            const lineIDsFromMappedSets = [];
            for (let j = 0; j < i; j += 1) {
                const prevSet = fixationsSets[j];
                if (prevSet[0].line === undefined) {
                    continue;
                }

                const prevSetY = avgY( prevSet );
                lineIDsFromMappedSets.push( prevSet[0].line + (currentSetY - prevSetY) / interlineDistance );
            }

            if (lineIDsFromMappedSets.length) {
                let avgID = lineIDsFromMappedSets.reduce( (acc, id) => (acc + id), 0 ) / lineIDsFromMappedSets.length;
                if (avgID < currentLineID) {
                    avgID += settings.currentLineSupportInCorrection;   // if between prev and current line, then support more the current line, thatn the previous
                }
                currentLineID = Math.min( maxID, Math.max( minID, Math.round( avgID ) ) );
            }
            else {
                currentLineID += 1;
            }
        }
        // else {
        //     currentLineY = textLines[ currentLineID ].y;
        // }

        if (initialLineID !== currentLineID) {
            log( `Line advanced: #${initialLineID} => ${currentLineID}` );
        }

        for (let j = 0; j < fixations.length; j += 1) {
            fixations[j].line = currentLineID;
        }

        // lastLineY = currentLineY;
        lastSetY = currentSetY;

        currentLineID += 1;
        // if (currentLineID >= textLines.length) {
        //     break;
        // }

        // currentLineY = textLines[ currentLineID ].y;
    }
// fixationsSets.forEach( (p, pi) => {
//     console.log('--',pi,'--');
//     console.log( p.map( (f, fi) => { return f.line; } ).join(' ') ) ;
// });
}

/**********************
    dropShortSets
**********************/
function dropShortestSet( fixationSets, minSetLength ) {
    const shortest = fixationSets.reduce(( acc, set, index ) => {
        if (set.length < acc.length) {
            return {
                index: index,
                length: acc.length
            };
        }
        else {
            return acc;
        }
    }, {index: -1, length: 100} );

    if (shortest.index >= 0 && shortest.length < minSetLength) {
        fixationSets.splice( shortest.index, 1 );
    }

    return fixationSets;
}

function dropAllShortSets( fixationSets, minSetLength ) {
    const result = [];

    for (let i = 0; i < fixationSets.length; i += 1) {
        const fixationSet = fixationSets[i];
        if (fixationSet.length >= minSetLength) {
            result.push( fixationSet );
        }
        else {
            fixationSet.removed = true;
        }
    }

    return result;
}

function dropShortSets( fixationSets, minSetLength, minSetsCount ) {
    if (minSetsCount === undefined) {
        return dropAllShortSets( fixationSets, minSetLength );
    }
    else {
        let result = fixationSets;
        while (result.length > minSetsCount ) {
            const shortened = dropShortestSet( result, minSetLength );
            if (shortened.length === result.length) {
                break;
            }
            result = shortened;
        }
        return result;
    }
}

module.exports = ProgressionMerger;