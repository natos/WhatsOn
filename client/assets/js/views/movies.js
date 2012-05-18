/* 
* MoviesView
* ----------
*
* Emitting events, UI changes
* Listen to the model for data changes
*
*/

define([

	'config/app',
	'modules/app'

], function MoviesView(c, App) {

/* private */

	var $window = $(window);

	/* constructor */
	function initialize() {

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

		App.emit(c.VIEW_LOADED, this);

		return this;

	};

	function resizeImages() {

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
	};

/* public */
	return {
		initialize: initialize
	};

});