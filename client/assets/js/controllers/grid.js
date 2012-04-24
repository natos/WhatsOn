define([

	'components/carousel'

], function(carousel) {

/* private */

var API_PREFIX = $('head').attr('data-api');
var supportsCSSFixedPosition = $('head').attr('data-fixposition').toLowerCase() === 'true';

var $window = $(window);

var	getViewportSize = function() {

	var v = {
		width	: this.window.width(),
		height	: this.window.height(),
		top		: this.window.scrollTop(),
		left	: this.window.scrollLeft()
	}

	Grid.viewport = v;

	return v;
}


/* grid class */
var Grid = {

	// DOM elements
	'el': $('#grid-container'),
	'header-bar': $('header.main'),
	'time-bar': $('#time-bar'),
	'time-bar-list': $('#time-bar ol'),
	'channels-bar': $('#channels-bar'),
	'channels-bar-list': $('#channels-bar ul'),

	//	constants
	MAX_DOM_ELEMENTS: 500,
	MILLISECONDS_IN_HOUR: 3600000,
	USE_MANUAL_TIME_CONTROLS: !supportsCSSFixedPosition,

	// 	maps
	viewport: {},
	eventsToRenderCount: 0,
	eventsBuffer: [],
	channelsOffsetMap: {},

	// support
	support: {
		cssFixedPosition: supportsCSSFixedPosition,
		touch: false
	}
};

	/* constructor */
	Grid.initialize = function() {

		// save this
		window.upc.controllers.grid = this;

		// this is a 'with mustard' view
		window.upc.mustard 

		// components
		this.components = {};

		// configure and run components

	};

	return Grid;

});