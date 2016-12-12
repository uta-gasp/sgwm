/*
    Marks fixations that are at the end of the progressive reading,
    i.e. last before the first fixation in the chain of regressive fixations
*/
'use strict';

function prevMappedFix( fixations, index, step ) {
    let result;
    let passed = 0;
    for (let i = index - 1; i >= 0; i -= 1) {
        const fix = fixations[i];
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

function nextMappedFix( fixations, index, step ) {
    let result;
    let passed = 0;
    for (let i = index + 1; i < fixations.length; i += 1) {
        const fix = fixations[i];
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

// Argument:
//   fixations (Array of Fixation)
// Notes:
//   added "isRegression" property for each fixation that is the last progressive reading fixation
module.exports = function( fixations ) {
    for (let i = 0; i < fixations.length; i += 1) {
        const fix = fixations[i];

        if (fix.line !== undefined && fix.word !== undefined) {
            const prevFix = prevMappedFix( fixations, i, 1 );
            fix.isRegression = prevFix && fix.line == prevFix.line && fix.word.index < prevFix.word.index;

            if (fix.isRegression) {    // requires correction in ceratin conditions
                const nextFix = nextMappedFix( fixations, i, 1 );
                if (nextFix !== undefined && nextFix.line != fix.line) {
                    fix.isRegression = false;
                }
                else {
                    const prev2Fix = prevMappedFix( fixations, i, 2 );
                    if (prevFix !== undefined && prev2Fix !== undefined && prevFix.line != prev2Fix.line) {
                        fix.isRegression = false;
                    }
                }
            }
        }
    }
}
