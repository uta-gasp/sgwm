const Settings = require('./settings');

class FarFixationFilterSettings extends Settings {
	constructor() {
		super( 'shortFixationFilter' );
		this._enabled = false;
		this._marginX = 200;
		this._marginY = 200;

		super.load();
	}

	get enabled() { return this._enabled; }
	set enabled( value ) { this._enabled = value; }
	get marginX() { return this._marginX; }
	set marginX( value ) { this._marginX = value; }
	get marginY() { return this._marginY; }
	set marginY( value ) { this._marginY = value; }
};

module.exports = FarFixationFilterSettings;