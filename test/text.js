const assert = require('assert');

const Text = require('./../src/text');

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

describe( 'Text', () => {
	it( 'should make 3 lines each of 3 words', () =>  {
		const text = new Text( words );
		assert.equal( 3, text.lines.length );
		assert.equal( text.lines[0].id, 0 );

		words[4].id = 4;
		assert.deepEqual( words[4], text.lines[1][1] );

		assert.deepEqual( text.box, {
        	left: 100,
        	top: 100,
        	right: 410,
        	bottom: 200
        });
		assert.equal( text.lineHeight, 20 );
		assert.equal( text.interlineDistance, 40 );
	});
});

