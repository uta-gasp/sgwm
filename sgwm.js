var sgwm =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const regression = __webpack_require__(1);
	const logger = __webpack_require__(2).Logger;

	(function(app) {

	    let MARGIN_X = 100;
	    let MARGIN_Y = 180;
	    let FIT_THESHOLD = 25;
	    let SKIMMING_THRESHOLD_X = 500;
	    let SKIMMING_THRESHOLD_Y = 40;
	    let SCALE_DIFF_THRESHOLD = 0.9;
	    let MAX_LINEAR_GRADIENT = 0.15;
	    let LONG_SET_LENGTH_THRESHOLD = 3;
	    let EMPTY_LINE_DETECTION_FACTOR = 1.7; // factor of the line height

	    let MIN_DURATION_REMOVING = 150; // ms, set to 0 to disable
	    let MIN_DURATION_MERGING = 240; // ms, set to 0 to disable
	    let MIN_INTERFIX_DIST = 40; // px
	    let DROP_SHORT_SETS = true;

	    let CORRECT_FOR_EMPTY_LINES = true;

	    const SET_TYPE = {
	        LONG: 'long',
	        SHORT: 'short',
	        ANY: 'any'
	    };

	    let log;

	    function settings (value) {
	        if (!value) {
	            return {
	                marginX: MARGIN_X,
	                marginY: MARGIN_Y,
	                fitThreshold: FIT_THESHOLD,
	                skimmigThresholdX: SKIMMING_THRESHOLD_X,
	                skimmigThresholdY: SKIMMING_THRESHOLD_Y,
	                scaleDiffThreshold: SCALE_DIFF_THRESHOLD,
	                maxLinearGradient: MAX_LINEAR_GRADIENT,
	                longSetLengthThreshold: LONG_SET_LENGTH_THRESHOLD,
	                emptyLineDetectionFactor: EMPTY_LINE_DETECTION_FACTOR,
	                minDurationRemoving: MIN_DURATION_REMOVING,
	                minDurationMerging: MIN_DURATION_MERGING,
	                minInterfixDist: MIN_INTERFIX_DIST,
	                correctForEmptyLines: CORRECT_FOR_EMPTY_LINES,
	                dropShortSets: DROP_SHORT_SETS,
	                logging: (logger || app.Logger).enabled
	            };
	        }
	        else {
	            MARGIN_X = value.marginX !== undefined ? value.marginX : MARGIN_X;
	            MARGIN_Y = value.marginY !== undefined ? value.marginY : MARGIN_Y;
	            FIT_THESHOLD = value.fitThreshold !== undefined ? value.fitThreshold : FIT_THESHOLD;
	            SKIMMING_THRESHOLD_X = value.skimmigThresholdX !== undefined ? value.skimmigThresholdX : SKIMMING_THRESHOLD_X;
	            SKIMMING_THRESHOLD_Y = value.skimmigThresholdY !== undefined ? value.skimmigThresholdY : SKIMMING_THRESHOLD_Y;
	            SCALE_DIFF_THRESHOLD = value.scaleDiffThreshold !== undefined ? value.scaleDiffThreshold : SCALE_DIFF_THRESHOLD;
	            MAX_LINEAR_GRADIENT = value.maxLinearGradient !== undefined ? value.maxLinearGradient : MAX_LINEAR_GRADIENT;
	            LONG_SET_LENGTH_THRESHOLD = value.longSetLengthThreshold !== undefined ? value.longSetLengthThreshold : LONG_SET_LENGTH_THRESHOLD;
	            EMPTY_LINE_DETECTION_FACTOR = value.emptyLineDetectionFactor !== undefined ? value.emptyLineDetectionFactor : EMPTY_LINE_DETECTION_FACTOR;
	            MIN_DURATION_REMOVING = value.minDurationRemoving !== undefined ? value.minDurationRemoving : MIN_DURATION_REMOVING;
	            MIN_DURATION_MERGING = value.minDurationMerging !== undefined ? value.minDurationMerging : MIN_DURATION_MERGING;
	            MIN_INTERFIX_DIST = value.minInterfixDist !== undefined ? value.minInterfixDist : MIN_INTERFIX_DIST;
	            CORRECT_FOR_EMPTY_LINES = value.correctForEmptyLines !== undefined ? value.correctForEmptyLines : CORRECT_FOR_EMPTY_LINES;
	            DROP_SHORT_SETS = value.dropShortSets !== undefined ? value.dropShortSets : DROP_SHORT_SETS,
	            (logger || app.Logger).enabled = value.logging !== undefined ? value.logging : (logger || app.Logger).enabled;
	        }
	    }

	    function map (data) {
	        if (!data.fixations || !data.words) {
	            return;
	        }

	        //log = (logger || app.Logger).forModule( 'StaticFit' ).log;
	        log = (logger || app.Logger).moduleLogPrinter( 'StaticFit' );

	        var text = getText( data.words );
	        //var fixations = filterFixations( data.fixations, text.box );
	        //var progressions = splitToProgressions( fixations );
	        if (MIN_DURATION_MERGING || MIN_DURATION_MERGING) {
	            data.fixations = filterFixations( data.fixations, text.box );
	        }
	        var progressions = splitToProgressions( data.fixations );
	        var sets = mergeSets( progressions, text.lines.length );
	        sets = dropShortSets( sets, 1 );
	        sortAndAlignLines( sets, text.lines );

	        if (data.maxLineID) {
	            sets = ensureCorrectMaxAssignedLineID( sets, text.lines, data.maxLineID );
	        }

	        //assignFixationsToLines( sets );
	        //log( 'Fixations distributed across lines', data.fixations );

	        mapToWords( sets, text.lines );
	        computeRegressions( data.fixations );
	        removeTransitionsToNextLine( data.fixations, data.words );
	    }

	    function getText (words) {
	        var lines = [];
	        var box = {left: Number.MAX_VALUE, top: Number.MAX_VALUE, right: 0, bottom: 0};
	        var currentY = Number.MIN_VALUE;
	        var currentLine;

	        var createNewLine = function (word) {
	            currentLine = [ word ];
	            currentLine.id = word.row - 1;
	            lines.push( currentLine );
	        };

	        for (var i = 0; i < words.length; i += 1) {
	            var word = words[i];
	            word.id = i;
	            if (word.x < box.left) { box.left = word.x;    }
	            if (word.y < box.top) { box.top = word.y;    }
	            if (word.x + word.width > box.right) { box.right = word.x + word.width;    }
	            if (word.y + word.height > box.bottom) { box.bottom = word.y + word.height;    }

	            if (word.y != currentY) {
	                currentY = word.y;
	                createNewLine( word );
	            }
	            else {
	                currentLine.push( word );
	            }
	        }

	        log( 'lines: ' + lines.length );

	        return {
	            box: box,
	            lines: lines
	        };
	    }

	    function filterFixations (fixations, textbox) {
	        return joinShortFixatoins( removeFarFixations( fixations, textbox ) );
	    }

	    function removeFarFixations (fixations, textbox) {
	        var result = [];

	        for (var i = 0; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            fix.id = i;
	            if (fix.x > textbox.left - MARGIN_X &&
	                fix.x < textbox.right + MARGIN_X &&
	                fix.y > textbox.top - MARGIN_Y &&
	                fix.y < textbox.bottom + MARGIN_Y) {
	                result.push( fix );
	            }
	        }

	        return result;
	    }

	    function joinShortFixatoins (fixations) {
	        const dist = (a, b) => Math.sqrt( Math.pow( a.x - b.x, 2 ) + Math.pow( a.y - b.y, 2 ) );
	        const join = (a, b) => {
	            let totalDuration = a.duration + b.duration;
	            a.x = (a.x * a.duration + b.x * b.duration) / totalDuration;
	            a.y = (a.y * a.duration + b.y * b.duration) / totalDuration;
	            a.duration = totalDuration;
	            a.merged = true;
	        };
	        const joinInteration = (fixes) => {
	            const result = [];
	            let prevFix, prevPrevFix;
	            for (let i = 0; i < fixes.length; i += 1) {
	                let fix = fixes[i];
	                if (prevPrevFix && prevFix.duration < MIN_DURATION_MERGING ) {
	                    let distToPrev = dist( prevFix, prevPrevFix );
	                    let distToNext = dist( prevFix, fix );
	                    if (distToPrev < MIN_INTERFIX_DIST || distToNext < MIN_INTERFIX_DIST) {
	                        if (distToNext < distToPrev) {
	                            join( fix, prevFix );
	                        }
	                        else {
	                            join( prevPrevFix, prevFix );
	                        }
	                        result.pop();
	                        prevFix = prevPrevFix;
	                    }
	                    else if (prevFix.duration < MIN_DURATION_REMOVING) {
	                        result.pop();
	                        prevFix = prevPrevFix;
	                    }
	                }

	                result.push( fix );

	                prevPrevFix = prevFix;
	                prevFix = fix;
	            }
	            return result;
	        };

	        let fixationCount;
	        let result = fixations;

	        do {
	            fixationCount = result.length;
	            result = joinInteration( result );
	        } while (result.length !== fixationCount);

	        return result;
	    }

	    function splitToProgressions (fixations) {
	        var result = [];
	        var currentLine;

	        var createNewSet = function (fixation) {
	            currentLine = [ fixation ];
	            result.push( currentLine );
	            return fixation;
	        };

	        var inReadingBox = function (dx, dy) {
	             return  dx > 0 && dx < SKIMMING_THRESHOLD_X &&
	                     Math.abs( dy ) < SKIMMING_THRESHOLD_Y;
	         };

	        var lastFix = createNewSet( fixations[0] );

	        for (var i = 1; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            if (!inReadingBox( fix.x - lastFix.x, fix.y - lastFix.y )) {
	                lastFix = createNewSet( fix );
	            }
	            else {
	                currentLine.push( fix );
	                lastFix = fix;
	            }
	        }

	        log( 'sets of progressive fixations:', result );
	        return result;
	    }

	    function dropShortSets (fixationSets, maxRejectionLength ) {
	        if (!DROP_SHORT_SETS) {
	            return fixationSets;
	        }

	        var result = [];

	        for (var i = 0; i < fixationSets.length; i += 1) {
	            var fixationSet = fixationSets[i];
	            if (fixationSet.length > maxRejectionLength) {
	                result.push( fixationSet );
	            }
	        }

	        return result;
	    }

	    function sortAndAlignLines (fixationLines, textLines) {
	        fixationLines.sort( (a, b) => {
	            return avgY( a ) - avgY( b );
	        });

	        let interlineDist = 9;
	        if (textLines.length > 1) {
	            let interlineDists = [];
	            for (let i = 1; i < textLines.length; i += 1) {
	                interlineDists.push( textLines[i][0].y - textLines[i - 1][0].y );
	            }
	            interlineDist = median( interlineDists );
	            /*/
	            for (let i = 1; i < textLines.length; i += 1) {
	                interlineDist += textLines[i][0].y - textLines[i - 1][0].y;
	            }
	            interlineDist = interlineDist / (textLines.length - 1);
	            */
	        }
	        else {
	            interlineDist = Number.MAX_VALUE;
	        }

	        let currentLineID = 0;
	        let lastLineY = 0;
	        for (let i = 0; i < fixationLines.length; i += 1) {
	            let fixations = fixationLines[i];
	            let currentLineY = 0;
	            for (let j = 0; j < fixations.length; j += 1) {
	                currentLineY += fixations[j].y;
	            }
	            currentLineY /= fixations.length;

	            if (CORRECT_FOR_EMPTY_LINES && i > 0 && (currentLineY - lastLineY) > EMPTY_LINE_DETECTION_FACTOR * interlineDist) {
	                console.log('-- line is ', currentLineID);
	                currentLineID += Math.round( (currentLineY - lastLineY) / interlineDist ) - 1;
	                console.log('    but corrected to ', currentLineID);
	            }

	            for (let j = 0; j < fixations.length; j += 1) {
	                fixations[j].line = currentLineID;
	            }

	            lastLineY = currentLineY;
	            currentLineID += 1;
	        }
	    }

	    function ensureCorrectMaxAssignedLineID( sets, lines, maxLineID ) {

	        const getMaxLineID = function  (sets) {
	            return sets.reduce( (acc1, set) => {
	                return set.reduce( (acc2, value) => {
	                    return acc2 > value.line ? acc2 : value.line;
	                }, acc1);
	            }, 0);
	        };

	        if (getMaxLineID( sets ) > maxLineID) {
	            let prevSetCount = sets.length;
	            sets = mergeSetsOfType( sets, maxLineID, SET_TYPE.LONG, 2, SET_TYPE.LONG );
	            if (sets.length != prevSetCount) {
	                console.log('    >1');
	                sortAndAlignLines( sets, lines );
	                console.log('    <');
	            }
	        }

	        if (getMaxLineID( sets ) > maxLineID) {
	            let prevSetCount = sets.length;
	            sets = mergeSetsOfType( sets, maxLineID, SET_TYPE.LONG, 1, SET_TYPE.LONG, Number.MAX_VALUE );
	            if (sets.length != prevSetCount) {
	                console.log('    >2');
	                sortAndAlignLines( sets, lines );
	                console.log('    <');
	            }
	        }

	        let currentMaxLineID = getMaxLineID( sets );
	        while (currentMaxLineID > maxLineID) {
	            // still the last line ID is too big... then search for a missed line ID
	            let mappedLineIDs = new Array( currentMaxLineID + 1);
	            for (let i = 0; i < sets.length; i += 1) {
	                mappedLineIDs[ sets[i][0].line ] = true;
	            }

	            let missingLineID = mappedLineIDs.reduceRight( (acc, val, index) => {
	                return acc < 0 && !val ? index : acc;
	            }, -1);

	            if (missingLineID < 0) {
	                break;
	            }

	            for (let i = sets.length - 1; i >= 0; i -= 1) {
	                if (sets[i][0].line > missingLineID) {
	                    let fixations = sets[i];
	                    for (let j = 0; j < fixations.length; j += 1) {
	                        fixations[j].line -= 1;
	                    }
	                }
	            }

	            currentMaxLineID = getMaxLineID( sets );
	        }

	        return sets;
	    }

	    function assignFixationsToLines (fixationLines) {

	        for (let i = 0; i < fixationLines.length; i += 1) {
	            let fixations = fixationLines[i];
	            for (let j = 0; j < fixations.length; j += 1) {
	                fixations[j].line = i;
	            }
	        }
	    }

	    function mapToWords (fixationLines, textLines) {

	        let getTextLine = function (lineID) {
	            let textLine;
	            for (let j = 0; j < textLines.length; j += 1) {
	                if (lineID === textLines[j].id) {
	                    textLine = textLines[j];
	                    break;
	                }
	            }
	            return textLine;
	        };

	        for (let i = 0; i < fixationLines.length; i += 1) {
	            let fixations = fixationLines[i];
	            let lineID = fixations[0].line;
	            let textLine = getTextLine( lineID );

	            if (textLine !== undefined) {
	                adjustFixations( fixations, textLine );
	                mapFixationsWithinLine( fixations, textLine );
	            }
	        }
	    }

	    function mergeSets (fixationsSets, lineCount) {

	        var result;

	        log( '============================' );
	        log( 'Joining only long sets' );
	        result = mergeSetsOfType( fixationsSets, lineCount, SET_TYPE.LONG );

	        log( '============================' );
	        log( 'Merging short to long sets' );
	        result = mergeSetsOfType( result, lineCount, SET_TYPE.SHORT );

	        log( '============================' );
	        log( 'Merging the remained single-fixation sets with short sets' );
	        result = mergeSetsOfType( result, lineCount, SET_TYPE.SHORT, 2 );

	        if (result.length > lineCount) {
	            log( '============================' );
	            log( 'Still too long. Merging the shorts sets with any other sets' );
	            result = mergeSetsOfType( result, lineCount, SET_TYPE.LONG, 2, SET_TYPE.LONG );
	        }

	        if (result.length > lineCount) {
	            log( '============================' );
	            log( 'And still too long... Just merge closest sets until we get the right number' );
	            result = dropShortSets( result, 2);
	            result = mergeSetsOfType( result, lineCount, SET_TYPE.LONG, 1, SET_TYPE.LONG, Number.MAX_VALUE );
	        }

	        log( '============================' );
	        log( 'Final sets', result );

	        return result;
	    }

	    function mergeSetsOfType (fixationsSets, lineCount, setLengthType, longSetThreshold, joiningLengthType, fitThreshold) {
	        while (fixationsSets.length > lineCount) {
	            var newSets = mergeTwoNearestSets( fixationsSets, setLengthType, longSetThreshold, joiningLengthType, fitThreshold );

	            if (!newSets) {
	                break;
	            }

	            fixationsSets = newSets;
	        }

	        return fixationsSets;
	    }

	    function mergeTwoNearestSets (fixationsSets, setLengthType, longSetThreshold, joiningLengthType, fitThreshold) {

	        var isForcedMerging = fitThreshold > 1;

	        joiningLengthType = joiningLengthType || SET_TYPE.LONG;
	        longSetThreshold = longSetThreshold || LONG_SET_LENGTH_THRESHOLD;
	        fitThreshold = fitThreshold || FIT_THESHOLD;

	        var unions = [];
	        for (var i = 0; i < fixationsSets.length; i += 1) {
	            var set1 = fixationsSets[i];
	            if (setLengthType === SET_TYPE.LONG && set1.length < longSetThreshold) {
	                continue;
	            }
	            else if (setLengthType === SET_TYPE.SHORT && set1.length >= longSetThreshold) {
	                continue;
	            }

	            for (var j = 0; j < fixationsSets.length; j += 1) {
	                if (i === j) {
	                    continue;
	                }

	                var set2 = fixationsSets[j];
	                if (joiningLengthType === SET_TYPE.LONG && set2.length < longSetThreshold) {
	                    continue;
	                }
	                else if (joiningLengthType === SET_TYPE.SHORT && set2.length >= longSetThreshold) {
	                    continue;
	                }

	                unions.push({
	                    set1: i,
	                    set2: j,
	                    error: getUnionError( set1, set2 )
	                });
	            }
	        }

	        var result;
	        var invalidUnions = {};

	        do {
	            var minError = Number.MAX_VALUE;
	            var minIndex = -1;
	            for (var n = 0; n < unions.length; n += 1) {
	                if (invalidUnions[n]) {
	                    continue;
	                }
	                var union = unions[n];
	                if (union.error < minError) {
	                    minIndex = n;
	                    minError = union.error;
	                }
	            }

	            if (minIndex >= 0 && minError < fitThreshold) {
	                var areSetsJoined = joinSets( fixationsSets, unions[ minIndex ], isForcedMerging ? Number.MAX_VALUE : undefined );
	                if (areSetsJoined) {
	                    result = fixationsSets;
	                }
	                else {
	                    invalidUnions[ minIndex ] = true;
	                }
	            }
	            else {
	                result = null;
	            }
	        } while (result === undefined);

	        return result;
	    }

	    function getUnionError( set1, set2 ) {
	        var newSet = set1.concat( set2 );
	        var model = regression.model( 'linear', fixationSetToFitArray( newSet ) );
	        return getFittingError( newSet, model.equation );
	    }

	    function joinSets( fixationsSets, union, maxGradient ) {
	        maxGradient = maxGradient || MAX_LINEAR_GRADIENT;

	        var set1 = fixationsSets[ union.set1 ];
	        var set2 = fixationsSets[ union.set2 ];
	        var newSet = set1.concat( set2 );

	        var model = regression.model( 'linear', fixationSetToFitArray( newSet ) );
	        if (Math.abs( model.equation[1] ) < maxGradient) {
	            var minIndex = Math.min( union.set1, union.set2 );
	            var maxIndex = Math.max( union.set1, union.set2 );

	            fixationsSets.splice( maxIndex, 1 );
	            fixationsSets.splice( minIndex, 1 );
	            fixationsSets.push( newSet );

	            log( 'best union:', union );
	            log( 'Joining sets: ', '1' ,set1, '2', set2 );
	            return true;
	        }

	        return false;
	    }

	    function fixationSetToFitArray (fixations) {
	        var result = [];
	        for (var i = 0; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            result.push( [fix.x, fix.y] );
	        }
	        return result;
	    }

	    function getFittingError (fixations, model) {
	        var error2 = 0;

	        for (var i = 0; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            var y = regression.fit( model, fix.x );
	            error2 += (fix.y - y) * (fix.y - y);
	        }

	        return Math.sqrt( error2 / fixations.length );
	    }

	    function avgY (fixations) {
	        var sumY = 0;
	        for (var i = 0; i < fixations.length; i += 1) {
	            sumY += fixations[i].y;
	        }
	        return sumY / fixations.length;
	    }

	    function adjustFixations( fixations, words ) {
	        const WORD_CHAR_SKIP_START = 3;
	        const WORD_CHAR_SKIP_END = 6;

	        const getNewLeftMostX = function (word) {
	            if (word.text.length > 2 * WORD_CHAR_SKIP_START) {
	                return word.x + Math.floor( WORD_CHAR_SKIP_START / word.text.length * word.width );
	            }
	            else {
	                return word.x + Math.floor( word.width / 2 );
	            }
	        };
	        const getNewRightMostX = function (word) {
	            if (word.text.length > WORD_CHAR_SKIP_START + WORD_CHAR_SKIP_END) {
	                return word.x + Math.floor( (word.text.length - WORD_CHAR_SKIP_END) / word.text.length * word.width );
	            }
	            else {
	                return word.x + Math.floor( word.width / 2 );
	            }
	        };

	        const firstWord = words[0];
	        const leftThreshold = firstWord.x + firstWord.width;
	        const lastWord = words[ words.length - 1 ];
	        const rightThreshold = lastWord.fixations && lastWord.fixations.length === 1 ? lastWord.x : lastWord.x + lastWord.width;

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

	        log( 'left: ' + leftMostX + ' ' + leftThreshold );
	        log( 'right: ' + rightMostX + ' ' + rightThreshold );

	        if (leftMostX < leftThreshold || rightMostX > rightThreshold) {
	            // Calculate the scaling factor
	            let newLeftMostX = leftMostX < leftThreshold ?  // if the left-most fixation lands left to the 2nd word...
	                            getNewLeftMostX( words[0] ) :   // ...estimate its expected location
	                            leftMostX;                      // otherwise we do not know where it shoud be...
	            let newRightMostX = rightMostX > rightThreshold ?               // if the right-most fixation lands right to the 2nd last word...
	                            getNewRightMostX( words[ words.length - 1] ) :  // ...estimate its expected location
	                            rightMostX;                                     // otherwise we do not know where it shoud be...
	            let newRange = newRightMostX - newLeftMostX;
	            let oldRange = rightMostX - leftMostX;
	            let scale = newRange / oldRange;

	            // limit the scaling factor
	            let boundCorrection = 0;
	            if (scale < SCALE_DIFF_THRESHOLD) {
	                scale = SCALE_DIFF_THRESHOLD;
	                boundCorrection = (scale * oldRange - newRange) / 2;
	            }
	            else if (scale > (2 - SCALE_DIFF_THRESHOLD)) {
	                scale = 2 - SCALE_DIFF_THRESHOLD;
	                boundCorrection = -(scale * oldRange - newRange) / 2;
	            }
	            newLeftMostX -= boundCorrection;
	            newRightMostX += boundCorrection;

	            // Recalculate x's
	            log( 'X >>>>>>' );
	            for (let i = 0; i < fixations.length; i += 1) {
	                let fix = fixations[i];
	                fix._x = fix.x;
	                fix.x = newLeftMostX + scale * (fix.x - leftMostX);
	                log( fix.x + ' >> ' + fix._x );
	            }
	        }
	    }

	    function mapFixationsWithinLine( fixations, words ) {
	        for (var i = 0; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            var minDist = Number.MAX_VALUE;
	            var minDistWordID = -1;
	            for (var j = 0; j < words.length; j += 1) {
	                var word = words[j];
	                var effectiveWordWidth = word.fixations || word.text.length < 3  ? 0.7 * word.width : word.width;
	                if (fix.x >= word.x && fix.x < effectiveWordWidth) {
	                    minDistWordID = j;
	                    minDist = 0;
	                    break;
	                }
	                else {
	                    var dist = Math.max( word.x - fix.x, fix.x - (word.x + effectiveWordWidth) );
	                    if (dist < minDist) {
	                        minDist = dist;
	                        minDistWordID = j;
	                    }
	                }
	            }

	            var closestWord = words[ minDistWordID ];
	            fix.word = {
	                left: closestWord.x,
	                top: closestWord.y,
	                right: closestWord.x + closestWord.width,
	                bottom: closestWord.y + closestWord.height,
	                index: minDistWordID,
	                text: closestWord.text,
	                id: closestWord.id
	            };

	            if (closestWord.fixations) {
	                closestWord.fixations.push( fix );
	            }
	            else {
	                closestWord.fixations = [ fix ];
	            }
	        }
	    }

	    function computeRegressions (fixations) {
	        var getPrevMappedFix = function (index, step) {
	            var result;
	            var passed = 0;
	            for (var i = index - 1; i >= 0; i -= 1) {
	                var fix = fixations[i];
	                if (fix.line !== undefined) {
	                    passed += 1;
	                    if (passed === step) {
	                        result = fix;
	                        break;
	                    }
	                }
	            }

	            return result;
	        };

	        var getNextMappedFix = function (index, step) {
	            var result;
	            var passed = 0;
	            for (var i = index + 1; i < fixations.length; i += 1) {
	                var fix = fixations[i];
	                if (fix.line !== undefined) {
	                    passed += 1;
	                    if (passed === step) {
	                        result = fix;
	                        break;
	                    }
	                }
	            }

	            return result;
	        };

	        for (var i = 0; i < fixations.length; i += 1) {
	            var fix = fixations[i];
	            if (fix.line !== undefined && fix.word !== undefined) {
	                var prevFix = getPrevMappedFix( i, 1 );
	                fix.isRegression = prevFix && fix.line == prevFix.line && fix.word.index < prevFix.word.index ? true : false;
	                if (fix.isRegression) {    // requires correction in ceratin conditions
	                    var nextFix = getNextMappedFix( i, 1 );
	                    if (nextFix !== undefined && nextFix.line != fix.line) {
	                        fix.isRegression = false;
	                    }
	                    else {
	                        //var prevFix = getPrevMappedFix( i, 1 );
	                        var prev2Fix = getPrevMappedFix( i, 2 );
	                        if (prevFix !== undefined && prev2Fix !== undefined && prevFix.line != prev2Fix.line) {
	                            fix.isRegression = false;
	                        }
	                    }
	                }
	            }
	        }
	    }

	    function removeTransitionsToNextLine (fixations, words) {
	        var index = fixations.length - 1;

	        const getPrevFixationOnLine = function (index) {
	            let result = null;
	            for (; index > 0; index -= 1) {
	                var fix = fixations[ index ];
	                if (fix.line !== undefined) {
	                    result = fix;
	                    break;
	                }
	            }

	            return result;
	        };

	        const getLastChunkSaccade = function (index, direction) {
	            let result = null;
	            for (; index > 0; index -= 1) {
	                var fix = fixations[ index ];
	                if (fix.line === undefined) {
	                    continue;
	                }

	                var prevFix = getPrevFixationOnLine( index - 1 );
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
	        };

	        while (index) {
	            let [firstProgressionFix, firstProgressionFixIndex] = getLastChunkSaccade( index, -1 );
	            if (!firstProgressionFixIndex) {
	                break;
	            }

	            var [lastProgressionFix, index] = getLastChunkSaccade( firstProgressionFixIndex, 1 );

	            if (!lastProgressionFix) {
	                continue;
	            }

	            if (firstProgressionFix.line === lastProgressionFix.line + 1) {
	                for (let i = index + 1; i < firstProgressionFixIndex; i += 1) {
	                    let fix = fixations[ i ];
	                    if (fix.word) {
	                        let word = words[ fix.word.id ];
	                        word.fixations = word.fixations.filter( f => f.id !== fix.id );
	                        fix.word = null;
	                        fix.line = undefined;
	                        log( 'Mapping removed for fix #', fix.id );
	                    }
	                }
	            }
	        }
	    }

	    function median (array) {
	        if (array.length <= 5) {
	            return array[ Math.floor( array.length / 2 ) ];
	        }

	        let sets = new Array( Math.floor( array.length / 5 ) + (array.length % 5 ? 1 : 0) );
	        for (let i = 0; i < sets.length; i+=1) {
	            sets[i] = [];
	        }
	        for (let i = 0; i < array.length; i+=1) {
	            sets[ Math.floor( i / 5 ) ].push( array[i] );
	        }

	        let medians = [];
	        sets.forEach( set => {
	            set.sort( (a, b) => {
	                return a - b;
	            });
	            medians.push( set[ Math.floor( set.length / 2 ) ] );
	        });

	        return median( medians );
	    }

	    // Export
	    app.StaticFit = {
	        map: map,
	        settings: settings
	    };

	})( this.Reading || module.exports );

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @license
	*
	* Regression.JS - Regression functions for javascript
	* http://tom-alexander.github.com/regression-js/
	*
	* copyright(c) 2013 Tom Alexander
	* Licensed under the MIT license.
	*
	**/

	;(function() {
	    'use strict';

	    var gaussianElimination = function(a, o) {
	           var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
	           for (i = 0; i < n; i++) {
	              maxrow = i;
	              for (j = i + 1; j < n; j++) {
	                 if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
	                    maxrow = j;
	              }
	              for (k = i; k < n + 1; k++) {
	                 tmp = a[k][i];
	                 a[k][i] = a[k][maxrow];
	                 a[k][maxrow] = tmp;
	              }
	              for (j = i + 1; j < n; j++) {
	                 for (k = n; k >= i; k--) {
	                    a[k][j] -= a[k][i] * a[i][j] / a[i][i];
	                 }
	              }
	           }
	           for (j = n - 1; j >= 0; j--) {
	              tmp = 0;
	              for (k = j + 1; k < n; k++)
	                 tmp += a[k][j] * x[k];
	              x[j] = (a[n][j] - tmp) / a[j][j];
	           }
	           return (x);
	    };

	    var methods = {
	        linear: function(data) {
	            var sum = [0, 0, 0, 0, 0], n = 0, results = [];

	            for (; n < data.length; n++) {
	              if (data[n][1] != null) {
	                sum[0] += data[n][0];
	                sum[1] += data[n][1];
	                sum[2] += data[n][0] * data[n][0];
	                sum[3] += data[n][0] * data[n][1];
	                sum[4] += data[n][1] * data[n][1];
	              }
	            }

	            var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
	            var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
	          //  var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

	            for (var i = 0, len = data.length; i < len; i++) {
	                var coordinate = [data[i][0], data[i][0] * gradient + intercept];
	                results.push(coordinate);
	            }

	            var string = 'y = ' + Math.round(gradient*100) / 100 + 'x + ' + Math.round(intercept*100) / 100;

	            return {equation: [intercept, gradient], points: results, string: string};
	        },

	        linearThroughOrigin: function(data) {
	            var sum = [0, 0], n = 0, results = [];

	            for (; n < data.length; n++) {
	                if (data[n][1] != null) {
	                    sum[0] += data[n][0] * data[n][0]; //sumSqX
	                    sum[1] += data[n][0] * data[n][1]; //sumXY
	                }
	            }

	            var gradient = sum[1] / sum[0];

	            for (var i = 0, len = data.length; i < len; i++) {
	                var coordinate = [data[i][0], data[i][0] * gradient];
	                results.push(coordinate);
	            }

	            var string = 'y = ' + Math.round(gradient*100) / 100 + 'x';

	            return {equation: [0, gradient], points: results, string: string};
	        },

	        exponential: function(data) {
	            var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

	            for (len = data.length; n < len; n++) {
	              if (data[n][1] != null) {
	                sum[0] += data[n][0];
	                sum[1] += data[n][1];
	                sum[2] += data[n][0] * data[n][0] * data[n][1];
	                sum[3] += data[n][1] * Math.log(data[n][1]);
	                sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
	                sum[5] += data[n][0] * data[n][1];
	              }
	            }

	            var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
	            var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
	            var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

	            for (var i = 0, len = data.length; i < len; i++) {
	                var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
	                results.push(coordinate);
	            }

	            var string = 'y = ' + Math.round(A*100) / 100 + 'e^(' + Math.round(B*100) / 100 + 'x)';

	            return {equation: [A, B], points: results, string: string};
	        },

	        logarithmic: function(data) {
	            var sum = [0, 0, 0, 0], n = 0, results = [];

	            for (len = data.length; n < len; n++) {
	              if (data[n][1] != null) {
	                sum[0] += Math.log(data[n][0]);
	                sum[1] += data[n][1] * Math.log(data[n][0]);
	                sum[2] += data[n][1];
	                sum[3] += Math.pow(Math.log(data[n][0]), 2);
	              }
	            }

	            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
	            var A = (sum[2] - B * sum[0]) / n;

	            for (var i = 0, len = data.length; i < len; i++) {
	                var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
	                results.push(coordinate);
	            }

	            var string = 'y = ' + Math.round(A*100) / 100 + ' + ' + Math.round(B*100) / 100 + ' ln(x)';

	            return {equation: [A, B], points: results, string: string};
	        },

	        power: function(data) {
	            var sum = [0, 0, 0, 0], n = 0, results = [];

	            for (len = data.length; n < len; n++) {
	              if (data[n][1] != null) {
	                sum[0] += Math.log(data[n][0]);
	                sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
	                sum[2] += Math.log(data[n][1]);
	                sum[3] += Math.pow(Math.log(data[n][0]), 2);
	              }
	            }

	            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
	            var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

	            for (var i = 0, len = data.length; i < len; i++) {
	                var coordinate = [data[i][0], A * Math.pow(data[i][0] , B)];
	                results.push(coordinate);
	            }

	             var string = 'y = ' + Math.round(A*100) / 100 + 'x^' + Math.round(B*100) / 100;

	            return {equation: [A, B], points: results, string: string};
	        },

	        polynomial: function(data, order) {
	            if(typeof order == 'undefined'){
	                order = 2;
	            }
	             var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

	                    for (; i < k; i++) {
	                       for (var l = 0, len = data.length; l < len; l++) {
	                          if (data[l][1] != null) {
	                           a += Math.pow(data[l][0], i) * data[l][1];
	                          }
	                        }
	                        lhs.push(a), a = 0;
	                        var c = [];
	                        for (var j = 0; j < k; j++) {
	                           for (var l = 0, len = data.length; l < len; l++) {
	                              if (data[l][1] != null) {
	                               b += Math.pow(data[l][0], i + j);
	                              }
	                            }
	                            c.push(b), b = 0;
	                        }
	                        rhs.push(c);
	                    }
	            rhs.push(lhs);

	           var equation = gaussianElimination(rhs, k);

	                for (var i = 0, len = data.length; i < len; i++) {
	                    var answer = 0;
	                    for (var w = 0; w < equation.length; w++) {
	                        answer += equation[w] * Math.pow(data[i][0], w);
	                    }
	                    results.push([data[i][0], answer]);
	                }

	                var string = 'y = ';

	                for(var i = equation.length-1; i >= 0; i--){
	                  if(i > 1) string += Math.round(equation[i] * Math.pow(10, i)) / Math.pow(10, i)  + 'x^' + i + ' + ';
	                  else if (i == 1) string += Math.round(equation[i]*100) / 100 + 'x' + ' + ';
	                  else string += Math.round(equation[i]*100) / 100;
	                }

	            return {equation: equation, points: results, string: string};
	        },

	        lastvalue: function(data) {
	          var results = [];
	          var lastvalue = null;
	          for (var i = 0; i < data.length; i++) {
	            if (data[i][1]) {
	              lastvalue = data[i][1];
	              results.push([data[i][0], data[i][1]]);
	            }
	            else {
	              results.push([data[i][0], lastvalue]);
	            }
	          }

	          return {equation: [lastvalue], points: results, string: "" + lastvalue};
	        }
	    };

	    var regression = {

	      model: function(method, data, order) {

	        if (typeof method == 'string') {
	          return methods[method](data, order);
	        }
	      },

	      fit: function (equation, x) {
	        var result = 0;
	        var value = 1;

	        if (!equation) {
	          return Number.MAX_VALUE;
	        }

	        for (var i = 0; i < equation.length; ++i) {
	          result += equation[i] * value;
	          value *= x;
	        }

	        return result;
	      }
	    };

	    if (true) {
	        module.exports = regression;
	    } else {
	        window.regression = regression;
	    }

	}());


/***/ },
/* 2 */
/***/ function(module, exports) {

	(function (app) {

	    var Logger = {
	        enabled: true
	    };

	    Logger.moduleErrorPrinter = (moduleName) => {
	        if (this.Reading !== undefined) {
	            return () => { };
	        }

	        return (missingService) => {
	            console.error( 'Missing "${missingService}" service for "${moduleName}"' );
	        };
	    };

	    Logger.moduleLogPrinter = (moduleName) => {
	        var print = (item) => {
	            console.log( item );
	        };

	        if (this.Reading !== undefined) {
	            return () => { };
	        }

	        return (title) => {
	            if (!Logger.enabled) {
	                return;
	            }

	            console.log( '\n', moduleName );
	            console.log( title );
	            for (var i = 1; i < arguments.length; i += 1) {
	                var data = arguments[i];
	                if (data === undefined) {
	                    continue;
	                }
	                if (data instanceof Array) {
	                    data.forEach( print );
	                }
	                else {
	                    console.log( data );
	                }
	            }
	        };
	    };

	    Logger.forModule = (moduleName) => {
	        // if (this.Reading !== undefined) {
	        //     return () => { };
	        // }

	        return {
	            start: (title) => {
	                return new Record( moduleName, title );
	            },
	            end: (record) => {
	                records.delete( record.id );
	            },
	            log: function () {
	                if (!Logger.enabled) {
	                    return;
	                }
	                console.log( moduleName, ...arguments );
	            }
	        };
	    };

	    function Record (module, title) {
	        this.id = Symbol( title );
	        this._record = []; //title ? [ title ] : [];
	        this.level = 0;

	        this.generalPadding = '';
	        for (let i = 0; i < records.size; i += 1) {
	            this.generalPadding += Record.padding;
	        }

	        records.set( this.id, this );

	        if (!Logger.enabled) {
	            return;
	        }

	        console.log( '' + this.generalPadding + module );

	        if (title) {
	            console.log( Record.padding + this.generalPadding + title );
	        }
	    }

	    Record.padding = '    ';

	    Record.prototype.push = function () {
	        var levelPadding = '';
	        for (var i = 0; i < this.level; i += 1) {
	            levelPadding += Record.padding;
	        }
	        //this._record.push( padding + Array.prototype.join.call( arguments, ' ' ) );
	        if (!Logger.enabled) {
	            return;
	        }
	        console.log( Record.padding + this.generalPadding + levelPadding + Array.prototype.join.call( arguments, ' ' ) );
	    };

	    Record.prototype.levelUp = function (text) {
	        if (text !== undefined) {
	            this.push( text );
	        }
	        this.level += 1;
	    };

	    Record.prototype.levelDown = function () {
	        this.level -= 1;
	        if (this.level < 0) {
	            this.level = 0;
	        }
	    };

	    Record.prototype.notEmpty = function () {
	        return this._record.length > 0;
	    };

	    Record.prototype.print = function () {
	        if (!Logger.enabled) {
	            return;
	        }
	        console.log( Record.padding + this.generalPadding + this._record.join( '\n' + Record.padding ) );
	    };

	    var records = new Map();

	    app.Logger = Logger;

	})( this.Reading || module.exports );

/***/ }
/******/ ]);