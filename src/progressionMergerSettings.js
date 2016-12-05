const Settings = require('./settings');

class ProgressionMergerSettings extends Settings {
	constructor() {
		super( 'progressionMergerSettings' );

		this._longSetLengthThreshold = 3;
		this._fitThreshold = 0.7;	// fraction of the average inter-line distance
		this._maxLinearGradient = 0.15;
		this._shortProgressionThreshold = 2;

		super.load();
	}

	get longSetLengthThreshold() { return this._longSetLengthThreshold; }
	set longSetLengthThreshold( value ) { this._longSetLengthThreshold = value; }
	get fitThreshold() { return this._fitThreshold; }
	set fitThreshold( value ) { this._fitThreshold = value; }
	get maxLinearGradient() { return this._maxLinearGradient; }
	set maxLinearGradient( value ) { this._maxLinearGradient = value; }
	get shortProgressionThreshold() { return this._shortProgressionThreshold; }
	set shortProgressionThreshold( value ) { this._shortProgressionThreshold = value; }
};

module.exports = ProgressionMergerSettings;