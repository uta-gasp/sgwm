/*
	Creates an array lines, each as array of word boxes
*/

class Text {
	// Arguments
	//	 words (Array of {x, y, width, height})
	constructor( words ) {
        const lines = [];
        const box = {
        	left: Number.MAX_VALUE,
        	top: Number.MAX_VALUE,
        	right: 0,
        	bottom: 0
        };

        let currentY = Number.MIN_VALUE;
        let currentLine;

        const createNewLine = function( word ) {
            currentLine = [ word ];
            currentLine.id = word.row - 1;
            lines.push( currentLine );
        };

        for (let i = 0; i < words.length; i += 1) {
            const word = Object.assign( {}, words[i] );
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
        this._lineHeight = lines[0][0].height;
	}

	get box() { return this._box; }
	get lines() { return this._lines; }
	get lineHeight() { return this._lineHeight;	}
}

module.exports = Text;