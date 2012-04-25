define([

], function() {

var $window = $(window);

var resizeImages = function() {

	var maxScreenWidth = Math.max($window.width(), $window.height()),
		imgSize, src, oldSrc, newSrc, $item;

	if (maxScreenWidth <= 865) {
		imgSize = 's';
	} else if (maxScreenWidth <= 1200) {
		imgSize = 'm'
	} else  {
		imgSize = 'l'
	}/* else {
		imgSize = 'xl'
	}*/

	src = '/assets/posters/' + imgSize + '/';

	console.log(maxScreenWidth, src);

	$('.poster img').each(function(index, item) {
		$item = $(item);
		oldSrc = $item.attr('src');
		newSrc = oldSrc.replace('/s/', '/' + imgSize + '/');
		if (oldSrc === newSrc) { return; }
		$item.attr('src', newSrc);
	});
};


var Movies = {};

	Movies.initialize = function() {

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

		return this;

	};

	return Movies;

});