'use strict';

const Settings = require('./settings');

class WordMapperSettings extends Settings {
	constructor() {
		super( 'wordMapperSettings' );
		this._wordCharSkipStart = 3;
		this._wordCharSkipEnd = 6;
		this._scalingDiffLimit = 0.9;
		this._rescaleFixationX = true;
		this._partialLengthMaxWordLength = 2;
		this._effectiveLengthFactor = 0.7;

		super.load();
	}

	get wordCharSkipStart() { return this._wordCharSkipStart; }
	set wordCharSkipStart( value ) { this._wordCharSkipStart = value; }
	get wordCharSkipEnd() { return this._wordCharSkipEnd; }
	set wordCharSkipEnd( value ) { this._wordCharSkipEnd = value; }
	get scalingDiffLimit() { return this._scalingDiffLimit; }
	set scalingDiffLimit( value ) { this._scalingDiffLimit = value; }
	get rescaleFixationX() { return this._rescaleFixationX; }
	set rescaleFixationX( value ) { this._rescaleFixationX = value; }
	get partialLengthMaxWordLength() { return this._partialLengthMaxWordLength; }
	set partialLengthMaxWordLength( value ) { this._partialLengthMaxWordLength = value; }
	get effectiveLengthFactor() { return this._effectiveLengthFactor; }
	set effectiveLengthFactor( value ) { this._effectiveLengthFactor = value; }
}

module.exports = WordMapperSettings;