'use strict';

const Settings = require('./settings');

class ProgressionSplitterSettings extends Settings {
	constructor() {
		super( 'progressionSplitterSettings' );
		this._bounds = {
			left: -0.5,
			right: 10,
			verticalChar: 1.5,	// in characters
			verticalLine: 0.65,	// in interline distances
		};
		this._angle = Math.sin( 15 * Math.PI / 180 );

		super.load();
	}

	get bounds() { return this._bounds; }
	set bounds( value ) { this._bounds = value; }
	get angle() { return this._angle; }
	set angle( value ) { this._angle = value; }

	pixelBounds( lineHeight, interlineDistance ) {
		const vertical = Math.min(
			this._bounds.verticalChar * lineHeight,
			this._bounds.verticalLine * interlineDistance
		);

		return {
			left: this._bounds.left * lineHeight,
			right: this._bounds.right * lineHeight,
			vertical: dx => vertical + dx * this._angle,
			_vertical: vertical
		};
	}
}

module.exports = ProgressionSplitterSettings;