/*
	Maps fixations to words within a line
*/
'use strict';

const WordMapperSettings = require('./wordMapperSettings');

const settings = new WordMapperSettings();

let log = () => {}; // Function( module, ...messages )

class WordMapper {
    // Arguments:
    //   logger ({ log(...) }): optional logger
    constructor( logger ) {
        settings.load();

        if (logger) {
            logger.log( '. . . . . . . . .' );
            log = (...params) => {
                logger.log( 'WordMapper   ', ...params );
            };
        }
    }
    // Arguments:
    //   fixationLines (Array of (Array of Fixation)): only (all) fixations from one array correspond
    //      to a text line
    //      the array is sorted top-to-bottom
    //   textLines (Array of (Array of Word))
    // Notes
    //   1. If rescaling is enabled, then updates fixation.x value and copies the original value to fixation._x
    //   2, Fixations mapped on a word get property "word" =
    //      {left, top, right, bottom, index=<index_in_line>, id=<index_in_text>, text }
    //   3. Words with mapped fixations get property "fixations" = (Array of Fixation)
    map( fixationLines, textLines ) {
        for (let i = 0; i < fixationLines.length; i += 1) {
            const fixations = fixationLines[i];
            const lineID = fixations[0].line;
            const textLine = getTextLine( textLines, lineID );

            if (textLine !== undefined) {
                if (settings.rescaleFixationX) {
                    rescaleFixations( fixations, textLine );
                }
                mapFixationsWithinLine( fixations, textLine );
            }
        }
    }

    // Arguments:
    //   fixations (Array of Fixation): the list of fixations
    //   words (Array of Word): the Text.words
    clean( fixations, words ) {
        removeTransitions( fixations, words );
    }
}

function getTextLine( textLines, lineID ) {
    let textLine;
    for (let i = 0; i < textLines.length; i += 1) {
        if (lineID === textLines[i].id) {
            textLine = textLines[i];
            break;
        }
    }
    return textLine;
}

/*****************
    rescaleFixations
*****************/

function getNewLeftMostX( word ) {
    if (word.text.length > 2 * settings.wordCharSkipStart) {
        return word.x + Math.floor( settings.wordCharSkipStart / word.text.length * word.width );
    }
    else {
        return word.x + Math.floor( word.width / 2 );
    }
}

function getNewRightMostX( word ) {
    if (word.text.length > settings.wordCharSkipStart + settings.wordCharSkipEnd) {
        return word.x + Math.floor( (word.text.length - settings.wordCharSkipEnd) / word.text.length * word.width );
    }
    else {
        return word.x + Math.floor( word.width / 2 );
    }
}

function getFixationsRange( fixations ) {
    let leftMostX = Number.MAX_VALUE,
        rightMostX = Number.MIN_VALUE;

    for (let i = 0; i < fixations.length; i += 1) {
        let fix = fixations[i];
        if (fix.x < leftMostX) {
            leftMostX = fix.x;
        }
        else if (fix.x > rightMostX) {
            rightMostX = fix.x;
        }
    }

    return { leftMostX, rightMostX };
}

function computeScale( newRange, oldRange ) {
    let scale = newRange / oldRange;

    // limit the scaling factor
    let newXCorrection = 0;
    if (scale < settings.scalingDiffLimit) {
        scale = settings.scalingDiffLimit;
        newXCorrection = (scale * oldRange - newRange) / 2;
    }
    else if (scale > (2 - settings.scalingDiffLimit)) {
        scale = 2 - settings.scalingDiffLimit;
        newXCorrection = -(scale * oldRange - newRange) / 2;
    }

    return { scale, newXCorrection };
}

function rescaleFixations( fixations, words ) {

    const firstWord = words[0];
    const lastWord = words[ words.length - 1 ];

    const leftThreshold = firstWord.x + firstWord.width;
    const rightThreshold = lastWord.fixations && lastWord.fixations.length === 1 ? lastWord.x : lastWord.x + lastWord.width;

    let { leftMostX, rightMostX } = getFixationsRange( fixations );

    log( 'rescaling...' );
    log( 'left: ' + leftMostX + ' ' + leftThreshold );
    log( 'right: ' + rightMostX + ' ' + rightThreshold );

    if (leftMostX < leftThreshold || rightMostX > rightThreshold) {
        // Calculate the scaling factor
        let newLeftMostX = leftMostX < leftThreshold ?  // if the left-most fixation lands left to the 2nd word...
                        getNewLeftMostX( words[0] ) :   // ...estimate its expected location
                        leftMostX;                      // otherwise we do not know where it shoud be...
        let newRightMostX = rightMostX > rightThreshold ?    // if the right-most fixation lands right to the 2nd last word...
                        getNewRightMostX( lastWord ) :       // ...estimate its expected location
                        rightMostX;                          // otherwise we do not know where it shoud be...
        const newRange = newRightMostX - newLeftMostX;
        const oldRange = rightMostX - leftMostX;
        const { scale, newXCorrection } = computeScale( newRange, oldRange );
        log( 'scale', scale );

        newLeftMostX -= newXCorrection;
        newRightMostX += newXCorrection;

        // Recalculate x's
        for (let i = 0; i < fixations.length; i += 1) {
            const fixation = fixations[i];
            fixation._x = fixation.x;
            fixation.x = newLeftMostX + scale * (fixation.x - leftMostX);
        }
    }
}

/**************
    mapFixationsWithinLine
**************/

function getClosestWordID( fixation, words ) {
    let minDist = Number.MAX_VALUE;
    let minDistWordID = -1;

    for (let i = 0; i < words.length; i += 1) {
        const word = words[i];
        const effectiveWordWidth = word.fixations || word.text.length <= settings.partialLengthMaxWordLength ?
            settings.effectiveLengthFactor * word.width : word.width;

        // BUGFIX: effectiveWordWidth =>> word.x + effectiveWordWidth
        if (fixation.x >= word.x && fixation.x < (word.x + effectiveWordWidth)) {
            minDistWordID = i;
            minDist = 0;
            break;
        }
        else {
            const dist = Math.max( word.x - fixation.x, fixation.x - (word.x + effectiveWordWidth) );
            if (dist < minDist) {
                minDist = dist;
                minDistWordID = i;
            }
        }
    }

    return minDistWordID;
}

function mapFixationsWithinLine( fixations, words ) {
    log( '== mapping ==' );
    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];

        const closestWordID = getClosestWordID( fixation, words );
        if (closestWordID < 0) {
            log( `${fixation.id} => ---` );
            continue;
        }

        const closestWord = words[ closestWordID ];
        fixation.word = {
            left: closestWord.x,
            top: closestWord.y,
            right: closestWord.x + closestWord.width,
            bottom: closestWord.y + closestWord.height,
            index: closestWordID,
            text: closestWord.text,
            id: closestWord.id
        };

        if (closestWord.fixations) {
            closestWord.fixations.push( fixation );
        }
        else {
            closestWord.fixations = [ fixation ];
        }

        log( `${fixation.id} => ${closestWord.id}` );
    }
}

/***************
    removeTransitions
***************/

function getPrevFixationOnLine( fixations, index ) {
    let result = null;
    for (; index > 0; index -= 1) {
        const fix = fixations[ index ];
        if (fix.line !== undefined) {
            result = fix;
            break;
        }
    }

    return result;
}

function getLastChunkSaccade( fixations, index, direction ) {
    let result = null;
    for (; index > 0; index -= 1) {
        const fix = fixations[ index ];
        if (fix.line === undefined) {
            continue;
        }

        const prevFix = getPrevFixationOnLine( fixations, index - 1 );
        if (!prevFix) {
            index = 0;
            break;
        }

        if (direction < 0 ? fix.x < prevFix.x : fix.x >= prevFix.x) {
            result = fix;
            break;
        }
    }

    return [ result, index ];
}

function removeFixation( fixations, id ) {
    return fixations.filter( fixation => fixation.id !== id );
}

function removeTransitions( fixations, words ) {
    let index = fixations.length - 1;

    while (index) {
        const [ firstProgressionFix, firstProgressionFixIndex ] = getLastChunkSaccade( fixations, index, -1 );
        if (!firstProgressionFixIndex) {
            break;
        }

        const [ lastProgressionFix, lastProgressionFixIndex ] = getLastChunkSaccade( fixations, firstProgressionFixIndex, 1 );
        index = lastProgressionFixIndex;
        if (!lastProgressionFix)  {
            continue;
        }

        if (firstProgressionFix.line !== lastProgressionFix.line) {
            for (let i = lastProgressionFixIndex + 1; i < firstProgressionFixIndex; i += 1) {
                const fix = fixations[ i ];
                if (fix.word) {
                    const word = words[ fix.word.id ];
                    if (word.fixations.length === 1) {
                        delete word.fixations;
                        log( 'removed @ word #', word.id );
                    }
                    else {
                        word.fixations = removeFixation( word.fixations, fix.id );
                        log( 'one removed @ word #', word.id );
                    }

                    delete fix.word;
                    delete fix.line;

                    log( 'removed @ fix #', fix.id );
                }
            }
        }
    }
}

module.exports = WordMapper;