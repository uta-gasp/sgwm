const Settings = require('./settings');

class ProgressionMergerSettings extends Settings {
	constructor() {
		super( 'progressionMergerSettings' );

		this._minLongSetLength = 3; 	// the minimal length of "long" set
		this._fitThreshold = 0.7;		// fraction of the average inter-line distance
		this._maxLinearGradient = 0.15;
		this._removeSingleFixationLines = false;

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
};

module.exports = ProgressionMergerSettings;