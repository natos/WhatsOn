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

	var executionTimer;
	var $window = $(window);

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {
console.log('moviesController.initialize');

		if ($('#content').find('#content-movies').length==0) {
			// Get grid container from server
			$('#content').load('/movies #content');
		}

		$window.on('resize orientationchange', handleResize);

		resizeImages();

		App.emit(c.VIEW_LOADED, this);

		return this;

	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		$window.off('resize orientationchange', handleResize);

	}

	/**
	 * Handler for resizing & orientationchange events.
	 * Uses an execution timer for throttling.
	 * @private
	 */
	function handleResize() {
		if (executionTimer) {
			clearTimeout(executionTimer);
		}

		executionTimer = setTimeout(function() {
			resizeImages();
		}, 200);
	}

	/**
	 * Resize content images for current screen dimensions 
	 * @private
	 */
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
		initialize: initialize,
		finalize: finalize
	};

});