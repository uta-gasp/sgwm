/*
	Create a set of chunks of progressive reading fixations
*/
const SplitToProgressionsSettings = require('./splitToProgressionsSettings');

const settings = new SplitToProgressionsSettings();
let bounds;

const isProgressiveReadingSaccade = function( dx, dy ) {
	return (
		dx > bounds.left &&
		dx < bounds.right &&
		Math.abs( dy ) < bounds.vertical( dx )
	);
};

// Arguments:
//   fixations (Array of Fixation)
//   lineHeight (Number): word box height in pixels
module.exports = function( fixations, lineHeight ) {
    settings.load();
    bounds = settings.pixelBounds( lineHeight );

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
}