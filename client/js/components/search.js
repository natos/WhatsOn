/*
* Search Button
* ----------
* @class SearchButton
*/

define([], function SearchButton() {

/* private */

	var $window = $(window),

	$box = $('.search-box'),

	$button = $('<a href="/search"></a>'),

	$close = $('<i>');

	/* constructor */
	function initialize(el) {

		var self = this;

		// not supported for fixed positioning
		if (!$('.fixed-top')[0]) {
			return this;
		}

		var label = $box.find('input').attr('placeholder');

		// build search button
		$button
			.addClass('search')
			.append('<i class="icon-search">')
			.append('<b class="label">' + label + '</i>')
			.appendTo('.nav')
			.on('click', function(event) {
				event.preventDefault();
				$box.toggleClass('active');
			});

		// build close button
		$close
			.addClass('icon-remove-sign')
			.appendTo('.search-box form')
			.click(function() {
				$box.removeClass('active');
			});

		return this;
	};

/* public */
	return {
		initialize: initialize
	};

});