/*
	Creates an array lines, each as array of word boxes
*/
'use strict';

class TextModel {
	// Arguments
	//	 words (Array of {x, y, width, height, text, row:optional=<line ID starting form 1>})
    // Notes:
    //   1. each word gets property "id" = <index in the text>
    //   2. the words in "lines" and "wrods" properties are copied (and shared between these two properties)
	constructor( words ) {
        const lines = [];
        const wordList = [];
        const box = {
        	left: Number.MAX_VALUE,
        	top: Number.MAX_VALUE,
        	right: 0,
        	bottom: 0
        };

        let currentLine;

        const createNewLine = function( word ) {
            currentLine = [ word ];
            currentLine.id = word.row === undefined ? lines.length : word.row - 1;
            currentLine.y = word.y;
            lines.push( currentLine );
        };

        let currentY = Number.MIN_VALUE;
        for (let i = 0; i < words.length; i += 1) {
            const word = Object.assign( {}, words[i] );
            wordList.push( word );

            word.id = i;
            if (word.x < box.left) { box.left = word.x; }
            if (word.y < box.top) { box.top = word.y; }
            if (word.x + word.width > box.right) { box.right = word.x + word.width; }
            if (word.y + word.height > box.bottom) { box.bottom = word.y + word.height; }

            if (word.y != currentY) {
                currentY = word.y;
                createNewLine( word );
            }
            else {
                currentLine.push( word );
            }
        }

        this._box = box;
        this._lines = lines;
        this._words = wordList;

        this._lineHeight = lines[0][0].height;
        this._interlineDistance = getInterlineDistance( lines );
	}

	get box() { return this._box; }
	get lines() { return this._lines; }
    get words() { return this._words; }
	get lineHeight() { return this._lineHeight;	}
    get interlineDistance() { return this._interlineDistance; }
}

function getInterlineDistance( lines ) {
    let interlineDist = 9;
    if (lines.length > 1) {
        const interlineDists = [];
        for (let i = 1; i < lines.length; i += 1) {
            interlineDists.push( lines[i].y - lines[i - 1].y );
        }
        interlineDist = median( interlineDists );
        /*/
        for (let i = 1; i < textLines.length; i += 1) {
            interlineDist += textLines[i].y - textLines[i - 1].y;
        }
        interlineDist = interlineDist / (textLines.length - 1);
        */
    }
    else {
        interlineDist = Number.MAX_VALUE;
    }

    return interlineDist;
}

function median( array ) {
    if (array.length <= 5) {
        return array[ Math.floor( array.length / 2 ) ];
    }

    const sets = new Array( Math.floor( array.length / 5 ) + (array.length % 5 ? 1 : 0) );
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

module.exports = TextModel;