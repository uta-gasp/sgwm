const Settings = require('./settings');

class FixationsRestructuringSettings extends Settings {
	constructor() {
		super();
		this._enabled = false;
		this._mergingDistanceThreshold = 40;
		this._removingDurationThreshold = 100;
		this._removingDurationThreshold = 80;

		super.load();
	}

	get enabled() { return this._enabled; }
	set enabled( value ) { this._enabled = value; }
	get mergingDistanceThreshold() { return this._mergingDistanceThreshold; }
	set mergingDistanceThreshold( value ) { this._mergingDistanceThreshold = value; }
	get mergingDurationThreshold() { return this._mergingDurationThreshold; }
	set mergingDurationThreshold( value ) { this._mergingDurationThreshold = value; }
	get removingDurationThreshold() { return this._removingDurationThreshold; }
	set removingDurationThreshold( value ) { this._removingDurationThreshold = value; }
};

module.exports = FixationsRestructuringSettings;