define([

	'config/app',
	'controllers/app'

], function(c, App) {

/* private */

var $window = $(window),

	resizeImages = function() {

		var maxScreenWidth = Math.max($window.width(), $window.height()),
			imgSize, oldSrc, newSrc, $item;
	
		if (maxScreenWidth <= 865) {
			imgSize = 's';
		} else if (maxScreenWidth <= 1200) {
			imgSize = 'm';
		} else  {
			imgSize = 'l';
		}/* else {
			imgSize = 'xl'
		}*/
	
		$('.poster img').each(function(index, item) {
			$item = $(item);
			oldSrc = $item.attr('src');
			newSrc = oldSrc.replace('/s/', '/' + imgSize + '/');
			if (oldSrc === newSrc) { return; }
			$item.attr('src', newSrc);
		});
	},

	/* @class Movies */
	Movies = {};

	/* constructor */
	Movies.initialize = function() {

		// Let the App know your here
		App.views.movies = this;

		var executionTimer;

		var sizeHandler = function(e) {

			if (executionTimer) {
				clearTimeout(executionTimer);
			}

			executionTimer = setTimeout(function() {

				resizeImages();

			}, 200);

		};

		$window.bind('resize orientationchange', sizeHandler);

		resizeImages();

		upc.emit(c.VIEW_LOADED, this);

		return this;

	};

	return Movies;

});