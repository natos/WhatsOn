define([

], function() {

	$window = $(window);

	$search = $('.search');

	$box = $('.search-box');

/* class */
var Search = {};

/* constructor */
	Search.initialize = function(el) {

		var self = this;

		// setup layout
		$search.click(function(event){

			event.preventDefault();

			$box.toggleClass('active');

		});

		$box.find('.icon-remove-sign').click(function() {
			$box.removeClass('active');
		});

		return this;
	};

	return Search;

});