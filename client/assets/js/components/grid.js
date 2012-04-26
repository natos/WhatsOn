define([

], function() {

var $body = $('body'),

	$button = $('<a href="/grid"></a>');

/* class */
var Grid = {};

/* constructor */
	Grid.initialize = function() {

		if ($body.hasClass('fixed-top')) {
			$button
				.addClass('grid')
				.html('<i class="icon-th"></i><b class="label">TV Gids</b>')
				.appendTo('.nav');

		}
		
		return this;
	};

	return Grid;

});