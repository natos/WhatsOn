/*
* GridButton
* ----------
* @class GridButton
*/

define([], function GridButton() {

/* private */

	var $body = $('body'),

	$button = $('<a href="/grid"></a>');

	/* constructor */
	function initialize() {

		if ($body.hasClass('fixed-top')) {
			$button
				.addClass('grid')
				.html('<i class="icon-th"></i><b class="label">TV Gids</b>')
				.appendTo('.nav');
		}
		
		return this;
	};

/* public */
	return {
		initialize: initialize
	};

});