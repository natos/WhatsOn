/* 
* MoviesView
* ----------
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view'

], function MoviesView(a, App, View) {

	var name = "movies";

/* private */

	var executionTimer;

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

		var maxScreenWidth = Math.max(a._win.innerWidth, a._win.innerHeight),
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
	}


/* public */

	function initialize() {

		a._win.addEventListener('resize', handleResize, true);
		a._win.addEventListener('orientationchange', handleResize, true);

		handleResize();

		return this;
	
	}

	function render() {

		return this;

	}

	function finalize() {

		a._win.removeEventListener('resize', handleResize, true);
		a._win.removeEventListener('orientationchange', handleResize, true);

		return this;

	}

/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});