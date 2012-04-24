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

		self.isAlwaysActive = false;

		// setup layout
		$search.on('click', function(event){

			event.preventDefault();

			if (!self.isAlwaysActive) {
				$box.toggleClass('active');
			}

		});

		$box.find('.icon-remove-sign').click(function() {
			$box.removeClass('active');
		});

		return this;
	};

	Search.calibrate = function() {

		var self = this;

		self.isAlwaysActive = true;

		$box.addClass('active');
		$box.find('.icon-remove-sign').hide();

		return this;

	};

	return Search;

});