define([

], function() {

/* private */

var $window = $(window);

/* @class Viewport */
var Viewport = {};

	/* constructor */
	Viewport.initialize = function(el) {
		return this;
	};

	/* get sizes */
	Viewport.get = function() {
		return {
			width	: $window.width(),
			height	: $window.height(),
			top		: $window.scrollTop(),
			left	: $window.scrollLeft()
		}
	}

	return Viewport;

});