/*
	Create a set of chunks of progressive reading fixations
*/
'use strict';

const SplitToProgressionsSettings = require('./splitToProgressionsSettings');

const settings = new SplitToProgressionsSettings();
let progressionBox;

const isProgressiveReadingSaccade = function( dx, dy ) {
	return (
		dx > progressionBox.left &&
		dx < progressionBox.right &&
		Math.abs( dy ) < progressionBox.vertical( dx )
	);
};

// Arguments:
//   fixations (Array of Fixation)
//   lineHeight (Number): word box height in pixels
module.exports = function( fixations, lineHeight, interlineDistance ) {
    settings.load();
    progressionBox = settings.pixelBounds( lineHeight, interlineDistance );

    const result = [];
    let currentProgression;

    const startNewProgression = function( fixation ) {
        currentProgression = [ fixation ];
        result.push( currentProgression );
    };

    let lastFix = fixations[0];
    startNewProgression( lastFix );

    for (let i = 1; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        if (!isProgressiveReadingSaccade( fixation.x - lastFix.x, fixation.y - lastFix.y )) {
            startNewProgression( fixation );
        }
        else {
            currentProgression.push( fixation );
        }
        lastFix = fixation;
    }

    return result;
};