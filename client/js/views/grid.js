/* 
* GridView 
* --------------
*
* Emitting events, UI changes
* Listen to the model for data changes
* 
* IMPORTANT: This component calculates the dimensions of the grid
* based on the size of other elements on the page (e.g. the channel bar)
* that are only sized correctly is the CSS is loaded already. If the CSS
* is not yet loaded, the grid dimensions will be calculated incorrectly.
*
* Because of cross-browser loading issues, requireJS cannot reliably detect
* when a CSS file has finished loading -- see http://requirejs.org/docs/faq-advanced.html#css
* This means that the relevant CSS must be injected into the <head> of the
* page when the original page is first rendered.
*
*/

define([

	'config/app',
	'config/grid',
	'modules/app',
	'lib/flaco/view',
	'components/timebar',
	'components/channelbar'

], function GridViewScope(a, g, App, View, TimeBar, ChannelBar) {

	var name = "grid";

/* private */

	var executionTimer,

		_gridcontainer;

	/**
	* Handler for scrolling and resizing events.
	* Uses an execution timer for throttling.
	* @private
	*/
	function handleResizeAndScroll() {
		// the grid has moved
		App.emit(g.GRID_MOVED);
		// erase the previous timer
		if (executionTimer) { clearTimeout(executionTimer);	}
		// set a delay of 200ms to fetch events
		executionTimer = setTimeout(function emitFetchEvents() { App.emit(g.GRID_FETCH_EVENTS); }, g.EXECUTION_DELAY);
	}

	/**
	* Handler for model data changes.
	* @private
	*/
	function modelChanged(changes) {
		if (typeof changes === 'undefined') { return; }
		// check for events changes to render
		if (changes.render) {
			// revieces a DocumentFragment to replace the entire grid
			// iterate and remove all its children
			while (_gridcontainer.firstChild) { _gridcontainer.removeChild(_gridcontainer.firstChild); }
			// append the _shadow grid
			_gridcontainer.appendChild(changes.render);
			// trigger rendered
			App.emit(g.GRID_RENDERED);
		}
	}

	/**
	* Generate a block of CSS to adapt the grid to the current viewport dimensions.
	* @private
	*/
	function defineStyles() {

		// define constants
		var $channelsbar = $('#channels-bar');
		var $timebar = $('#time-bar');

		g.TIMEBAR_HEIGHT = $timebar.height();
		g.CHANNELS_COUNT = $channelsbar.find('li').length;
		g.CHANNEL_BAR_WIDTH = $channelsbar.width();
		g.VIEWPORT_WIDTH_HOURS = (document.body.clientWidth - g.CHANNEL_BAR_WIDTH) / g.HOUR_WIDTH;
		// Size the grid
		g.GRID_HEIGHT = g.ROW_HEIGHT * g.CHANNELS_COUNT;
		g.GRID_WIDTH = g.HOUR_WIDTH * 24;

		var cssText = [];
			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('#grid-container {height:' + g.GRID_HEIGHT + 'px;width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;margin-top:' + g.TIMEBAR_HEIGHT + 'px;}');
			cssText.push('#grid-container .grid-event {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#channels-bar li {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#time-bar ol {width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;}');
			cssText.push('#time-bar li {width:' + g.HOUR_WIDTH + 'px;}');
			cssText.push('.channel-container {height:' + g.ROW_HEIGHT + 'px;}');

		return cssText.join('\n');

	}

	/**
	* Add or update a named <style> element to the DOM.
	* @private
	*/
	function appendCSSBlock(blockId, cssText) {
		var el = document.getElementById(blockId);
		if (el) {
			el.innerHTML = cssText;
		} else {
			el = document.createElement('style');
			el.id = blockId;
			el.innerHTML = cssText;
			document.getElementsByTagName('HEAD')[0].appendChild(el);
		}
	}

/* public */

	/**
	* Determine what time window is visible in the viewport.
	* @public
	*/
	function getSelectedTime() {

		// How many hours have been scrolled horizontally?
		var hoursScrolledLeft = window.pageXOffset / g.HOUR_WIDTH,
			// Calculate the left border time, and right border time
			leftBorderTime = new Date(g.zeroTime.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) - (g.VIEWPORT_WIDTH_HOURS/4 * g.MILLISECONDS_IN_HOUR)),
			rightBorderTime = new Date(g.zeroTime.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) + (g.VIEWPORT_WIDTH_HOURS * g.MILLISECONDS_IN_HOUR));

		return {
			startTime: leftBorderTime,
			endTime: rightBorderTime
		};

	}

	/**
	* Determine what channels are visible in the viewport.
	* Optionally, return some channels above and below the visible
	* channel range, for pre-loading.
	* @public
	*/
	function getSelectedChannels(extraAboveAndBelow) {
		// delegate to the getSelectedChannels method of the channelbar component
		return ChannelBar.getSelectedChannels(extraAboveAndBelow);
	}

/* abstract */

	function initialize() {

		// UI event handlers
		// every time user scrolls, we want to load new events
		a.$window.on('resize scroll', handleResizeAndScroll);

		// The model recieves events
		// we are listening to render new events
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;

	}

	function render() {

		_gridcontainer = document.getElementById('grid-container');

		// detecting first render
		// NS: maybe there's a better way
		//     I'm thinking in define every variable CSS on config files
		//	   to avoid dependencies
		if ( document.getElementById('channels-bar-list').children.length === 0 ) {
			// render channel rows and list
			ChannelBar.renderChannelsGroup();
			// attach some cool styles
			appendCSSBlock(name + '-styles', defineStyles());
		}

		return this;
	}

	function finalize() {

		a.$window.off('resize scroll', handleResizeAndScroll);

		App.off(g.MODEL_CHANGED, modelChanged);

		return this;

	}


/* export */

	return new View({
		name				: name,
		initialize			: initialize,
		finalize			: finalize,
		render				: render,
		getSelectedChannels	: getSelectedChannels,
		getSelectedTime		: getSelectedTime,
		components			: {
			timebar		: TimeBar,
			channelbar	: ChannelBar
		}
	});

});