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
let logger = {
    log: function() {} // Function( module, ...messages )
};

class ProgressionMerger {
    constructor( interLineDistance, logger_ ) {
        settings.load();
        settings.fitThreshold *= interLineDistance;

        if (logger_) {
            logger = logger_;
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
    merge( progressions, lineCount ) {
        let result = progressions.map( set => set );
        logger.log( '#0:', result.length );

        // 1. join only long sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, SET_TYPE.LONG, settings.minLongSetLength );
        logger.log( '#1a:', result.length );

        // 2. join short sets with long sets
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT, SET_TYPE.LONG, settings.minLongSetLength );
        logger.log( '#1b:', result.length );

        // 3. join the remaining single-fixation sets with multi-fixation sets
        const multiFixationSetLength = 2;
        result = joinSetsOfType( result, lineCount, SET_TYPE.SHORT, SET_TYPE.LONG, multiFixationSetLength );
        logger.log( '#1c:', result.length );

        if (result.length > lineCount) {
            // still too many: join any multi-fixation set with any other multi-fixation set
            result = joinSetsOfType( result, lineCount, SET_TYPE.LONG, SET_TYPE.LONG, multiFixationSetLength );
            logger.log( '#2:', result.length );
        }
        else if (settings.removeSingleFixationLines) {
            result = dropShortSets( result, 2 );
        }

        if (result.length > lineCount) {
            // and still too many...
            // drop short sets
            result = dropShortSets( result, settings.minLongSetLength );
            logger.log( '#3a:', result.length );

            // then force joining the closest sets
            result = joinSetsOfType( result, lineCount, SET_TYPE.ANY, SET_TYPE.ANY, 1, true );
            logger.log( '#3b:', result.length );
        }

        return result;
    }
}

function joinSetsOfType( fixationsSets, lineCount, primarySetType, secondarySetType, minLongSetLength, forced ) {
    let result = fixationsSets;

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

function createPairs( fixationsSets, primarySetType, secondarySetType, setSetTypeThreshold) {
    const pairs = [];
    for (let i = 0; i < fixationsSets.length; i += 1) {
        const set1 = fixationsSets[i];
        if (!isValidSet( set1, primarySetType, setSetTypeThreshold )) {
            continue;
        }

        // Compute proximity of each set pair
        for (let j = 0; j < fixationsSets.length; j += 1) {
            if (i === j) {
                continue;
            }

            const set2 = fixationsSets[j];
            if (!isValidSet( set2, secondarySetType, setSetTypeThreshold )) {
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
    findAndJoinClosestPair
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

        //console.log( 'Joining sets: ', '\n1:\n' ,set1, '\n2:\n', set2 );
        return true;
    }

    return false;
}

function findAndJoinClosestPair( fixationsSets, pairs, forced ) {
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
            //console.log( 'best pair:', pair );
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


module.exports = ProgressionMerger;