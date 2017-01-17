'use strict';

const Settings = require('./settings');

class ProgressionMergerSettings extends Settings {
	constructor() {
		super( 'progressionMergerSettings' );

		this._minLongSetLength = 3; 	// the minimal length of "long" set
		this._fitThreshold = 0.3;		// fraction of the average inter-line distance
		this._maxLinearGradient = 0.15; // the maximum difference in equation gradients for fixations that can be joined
		this._removeSingleFixationLines = false;
		this._correctForEmptyLines = true;
		this._emptyLineDetectorFactor = 1.7;	// multiplier to interlineDistance

		super.load();
	}

	get minLongSetLength() { return this._minLongSetLength; }
	set minLongSetLength( value ) { this._minLongSetLength = value; }
	get fitThreshold() { return this._fitThreshold; }
	set fitThreshold( value ) { this._fitThreshold = value; }
	get maxLinearGradient() { return this._maxLinearGradient; }
	set maxLinearGradient( value ) { this._maxLinearGradient = value; }
	get removeSingleFixationLines() { return this._removeSingleFixationLines; }
	set removeSingleFixationLines( value ) { this._removeSingleFixationLines = value; }
	get correctForEmptyLines() { return this._correctForEmptyLines; }
	set correctForEmptyLines( value ) { this._correctForEmptyLines = value; }
	get emptyLineDetectorFactor() { return this._emptyLineDetectorFactor; }
	set emptyLineDetectorFactor( value ) { this._emptyLineDetectorFactor = value; }
}

module.exports = ProgressionMergerSettings;