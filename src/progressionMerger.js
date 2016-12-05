/*
    Merges progressive reading fixations within the text lines
*/

const regression = require('./regression.js');
const ProgressionMergerSettings = require('./progressionMergerSettings');

const settings = new ProgressionMergerSettings();

const SET_TYPE = {
    LONG: 1,
    SHORT: 2,
    ANY: 3
};

let fitThreshold;

class ProgressionMerger {
    constructor( interLineDistance ) {
        settings.load();
        settings.fitThreshold *= interLineDistance;

        this.debug = {
            joinSetsOfType: joinSetsOfType,
            createPairs: createPairs,
            findAndJoinNearests: findAndJoinNearests,
        };
    }

    // Arguments:
    //   progressions (Array of (Array of Fixation))
    //   lineCount (Integer): number of text lines
    merge( progressions, lineCount ) {
        let result;

        // join only long sets
        result = joinSetsOfType( progressions, lineCount, SET_TYPE.LONG );

        // join short sets with long sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT );

        // join the remained single-fixation sets with short sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT, 2 );

        if (result.length > lineCount) {
            // still too many: join the short sets with any other sets
            result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, 2, SET_TYPE.LONG );
        }

        if (result.length > lineCount) {
            // and still too many... drop shortest sets and try joining the closest ones
            // until we get the right number
            result = dropShortSets( result );
            result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, 1, SET_TYPE.LONG, true );
        }

        return result;
    }
}

function joinSetsOfType( fixationsSets, lineCount, setLengthType, longSetThreshold, joiningLengthType, forced ) {
    let result = fixationsSets;

    while (result.length > lineCount) {
        const pairs = createPairs( result, setLengthType, longSetThreshold, joiningLengthType );
        const updatedSets = findAndJoinNearests( result, pairs, forced );

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

function getFittingError( fixations, model ) {
    let error = 0;

    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        const y = regression.fit( model, fixation.x );
        error += (fixation.y - y) * (fixation.y - y);
    }

    return Math.sqrt( error / fixations.length );
}

function fixationsToArray( fixations ) {
    const result = [];
    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        result.push([ fixation.x, fixation.y ]);
    }
    return result;
}

function getJoinedPairFitError( set1, set2 ) {
    const fixations = set1.concat( set2 );
    const model = regression.model( 'linear', fixationsToArray( fixations ) );

    let error = 0;

    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        const y = regression.fit( model.equation, fixation.x );
        error += (fixation.y - y) * (fixation.y - y);
    }

    return Math.sqrt( error / fixations.length );
}

function createPairs( fixationsSets, setLengthType, longSetThreshold, joiningLengthType = SET_TYPE.LONG) {
    // ensure the threshold is a valid value
    longSetThreshold = longSetThreshold || settings.longSetLengthThreshold;

    const pairs = [];
    for (let i = 0; i < fixationsSets.length; i += 1) {
        const set1 = fixationsSets[i];
        if (!isValidSet( set1, setLengthType, longSetThreshold )) {
            continue;
        }

        // Compute proximity of each set pair
        for (let j = 0; j < fixationsSets.length; j += 1) {
            if (i === j) {
                continue;
            }

            const set2 = fixationsSets[j];
            if (!isValidSet( set2, joiningLengthType, longSetThreshold )) {
                continue;
            }

            pairs.push({
                set1: i,
                set2: j,
                error: getJoinedPairFitError( set1, set2 )
            });
        }
    }

    return pairs;
}

/**********************
    findAndJoinNearests
**********************/

function joinSets( fixationsSets, id1, id2, forced ) {
    const maxGradient = forced ? Number.MAX_VALUE : settings.maxLinearGradient;

    const set1 = fixationsSets[ id1 ];
    const set2 = fixationsSets[ id2 ];
    const joinedSet = set1.concat( set2 );

    const model = regression.model( 'linear', fixationsToArray( joinedSet ) );
    const gradient = model.equation[1];

    if (Math.abs( gradient ) < maxGradient) {
        const minIndex = Math.min( id1, id2 );
        const maxIndex = Math.max( id1, id2 );

        fixationsSets.splice( maxIndex, 1 );
        fixationsSets.splice( minIndex, 1 );
        fixationsSets.push( joinedSet );

        console.log( 'Joining sets: ', '\n1:\n' ,set1, '\n2:\n', set2 );
        return true;
    }

    return false;
}

function findAndJoinNearests( fixationsSets, pairs, forced ) {
    // ensure the arguments have valid values
    fitThreshold = forced ? Number.MAX_VALUE : settings.fitThreshold;

    let result;

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
            console.log( 'best pair:', pair );
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
        //  - all pairs has too distance component, or
        //  - all pairs produce too inclined set of fixations, or
        //  - the pair or the closest sets were joined together
    } while (result === undefined);

    return result;
}

function dropShortSets( fixationSets ) {
    if (settings.shortProgressionThreshold < 1) {
        return fixationSets;
    }

    var result = [];

    for (var i = 0; i < fixationSets.length; i += 1) {
        var fixationSet = fixationSets[i];
        if (fixationSet.length > settings.shortProgressionThreshold) {
            result.push( fixationSet );
        }
    }

    return result;
}


module.exports = ProgressionMerger;