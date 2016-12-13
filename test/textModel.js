const assert = require('assert');

const TextModel = require('./../src/textModel');

function Word( x, y, w, h ) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
}

const words = [
	new Word(100, 100, 90, 20),
	new Word(200, 100, 90, 20),
	new Word(300, 100, 90, 20),
	new Word(100, 140, 90, 20),
	new Word(200, 140, 90, 20),
	new Word(300, 140, 110, 20),
	new Word(100, 180, 90, 20),
	new Word(200, 180, 90, 20),
	new Word(300, 180, 90, 20),
];

describe( 'TextModel', () => {
	it( 'should make 3 lines each of 3 words', () =>  {
		const text = new TextModel( words );
		assert.equal( 3, text.lines.length, 'line count is not 3' );
		assert.equal( text.lines[0].id, 0, 'first line is not 0' );

		words[4].id = 4;
		assert.deepEqual( words[4], text.lines[1][1], 'word.4 is the second word of line.1' );

		assert.deepEqual( text.box, {
        	left: 100,
        	top: 100,
        	right: 410,
        	bottom: 200
        }, 'text box is not as expected');
		assert.equal( text.lineHeight, 20, 'line height is not 20' );
		assert.equal( text.interlineDistance, 40, 'interline distance is not 40' );
	});
});

