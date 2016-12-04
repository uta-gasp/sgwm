const Settings = require('./settings');

class ProgressionSplitterSettings extends Settings {
	constructor() {
		super( 'progressionSplitterSettings' );
		this._bounds = {
			left: -2,
			right: 20,
			vertical: 2.5,
		};
		this._angle = Math.sin( 10 * Math.PI / 180 );

		super.load();
	}

	get bounds() { return this._bounds; }
	set bounds( value ) { this._bounds = value; }
	get angle() { return this._angle; }
	set angle( value ) { this._angle = value; }

	pixelBounds( lineHeight ) {
		return {
			left: this._bounds.left * lineHeight,
			right: this._bounds.right * lineHeight,
			vertical: dx => this._bounds.vertical * lineHeight + dx * this._angle
		};
	}
};

module.exports = ProgressionSplitterSettings;