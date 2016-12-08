/*
    Filters out fixatins far from the text
*/

const FarFixationFilterSettings = require('./farFixationFilterSettings');

const settings = new FarFixationFilterSettings();

// Arguments
//   fixations (Array of Fixation)
//   textbox {left, right, top, bottom}
// Returns
//   new array with original fixations (Array of Fixation)
module.exports = function( fixations, textbox ) {
    settings.load();

    if (!settings.enabled || !textbox) {
        return fixations;
    }

    const result = [];

    for (let i = 0; i < fixations.length; i += 1) {
        const fixation = fixations[i];
        if (fixation.x > textbox.left - settings.marginX &&
                fixation.x < textbox.right + settings.marginX &&
                fixation.y > textbox.top - settings.marginY &&
                fixation.y < textbox.bottom + settings.marginY) {
            result.push( fixation );
        }
    }

    return result;
}

