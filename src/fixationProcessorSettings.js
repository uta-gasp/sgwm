'use strict';

const Settings = require('./settings');

class FixationProcessorSettings extends Settings {
	constructor() {
		super( 'fixationProcessorSettings' );
		this._location = {
			enabled: false,
			marginX: 200,
			marginY: 200
		};
		this._duration = {
			enabled: false,
			mergingDistanceThreshold: 40,
			mergingDurationThreshold: 100,
			removingDurationThreshold: 80
		};

		super.load();
	}

	get location() { return this._location; }
	set location( value ) { this._location = value; }
	get duration() { return this._duration; }
	set duration( value ) { this._duration = value; }
}

module.exports = FixationProcessorSettings;