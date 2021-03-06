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
	'config/channel',
	'modules/app',
	'modules/event',
	'models/channel',
	'lib/flaco/view',
	'components/timebar',
	'components/channelbar',
	'components/highlight',
	'utils/convert',
	'utils/dom',
	'utils/language'

], function GridViewScope(a, g, c, App, Event, ChannelModel, View, TimeBar, ChannelBar, Highlight, convert, dom, Language) {

	var name = "grid",

		components = {
			channelbar	: ChannelBar,
			timebar		: TimeBar,
			highlight	: Highlight
		},

/* private */

	// Translations
	_lang,

	// DOM reference
	_container,

	// Objects
	_gridcontent = dom.element('div', { id: 'grid-content' }),
	_gridcontainer = dom.element('div', { id: 'grid-container' }),
	_channelsbar = dom.element('div', { id: 'channels-bar' }),
	_timebar = dom.element('div', { id: 'time-bar' }),
	_ticker,

	// Touch coordinates, used for checking velocity
	_previousTouchX, _previousTouchY, _previousTouchTime,
	_touchVelocityX = 0,
	_touchVelocityY = 0,

	executionTimer,

	timer = {
		clock	: void 0,
		time	: 1000 * 5, // time to tick
		status	: false,
		start	: timer_start,
		tick	: timer_run,
		stop	: timer_stop
	};

	/**
	* Handler for scrolling and resizing events.
	* Uses an execution timer for throttling.
	* @private
	*/
	function handleResizeAndScroll() {
		// the grid has moved
		Event.emit(g.MOVED);
		// erase the previous timer
		if (executionTimer) { clearTimeout(executionTimer);	}
		// set a delay of 200ms to fetch events
		executionTimer = setTimeout(function emitFetchEvents() { Event.emit(g.FETCH_EVENTS); }, g.EXECUTION_DELAY);
	}

	function updateTouchVelocity(e) {
		if (e && e.changedTouches && e.changedTouches.length==1) {
			var currentX = e.changedTouches[0].pageX;
			var currentY = e.changedTouches[0].pageY;
			var currentTime = new Date();

			if (_previousTouchX && _previousTouchY && _previousTouchTime) {
				var interval = (currentTime.valueOf() - _previousTouchTime.valueOf()) / 1000;
				_touchVelocityX = (currentX - _previousTouchX) / interval;
				_touchVelocityY = (currentY - _previousTouchY) / interval;
			}

			_previousTouchX = currentX;
			_previousTouchY = currentY;
			_previousTouchTime = currentTime;
		}
	}

	function onTouchEnd(e) {

		if (Math.abs(_touchVelocityX) > 200 || Math.abs(_touchVelocityY) > 200) {
			if (_timebar) { _timebar.style.display = 'none'; }
			if (_channelsbar) { _channelsbar.style.display = 'none'; }
		}
	}

	var restoreHeadersExecutionTimer;
	function restoreHeaders() {
		// erase the previous timer
		if (restoreHeadersExecutionTimer) { clearTimeout(restoreHeadersExecutionTimer);	}
		// set a delay of 200ms to fetch events
		restoreHeadersExecutionTimer = setTimeout(function emitSomeThingElse() {
			if (_timebar) { _timebar.style.display = 'block'; }
			if (_channelsbar) { _channelsbar.style.display = 'block'; }
		}, 100);
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
			_ticker = document.getElementById('timer-ticker');
			timer.tick();
			// trigger rendered
			Event.emit(g.GRID_RENDERED);
		}

		if (changes.overlay) {
			
			var overlay = changes.overlay,
				event;

			render = [];
			render.push('<h1>' + overlay.title + '</h1>');
			render.push('<h2>' + overlay.episodeTitle + '</h2>');
			render.push('<p>' + overlay.shortDescription + '</p>');

			if (overlay.events.data.length > 0) {
				render.push('<h3>' + _lang.translate('watch-again') + '</h3>');
				render.push('<ul>');
			}

			for (var i = 0, t = overlay.events.data.length; i<t; i++) {
				event = overlay.events.data[i];
				console.log(event);
				render.push('<li>' + event.start + '</li>');
			}
			if (overlay.events.data.length > 0) {
				render.push('</ul>');
			}
			
			Overlay.show(render.join('\n'));

			console.log(overlay);
		}
	}

	/**
	* Generate a block of CSS to adapt the grid to the current viewport dimensions.
	* @private
	*/
	function drawStyles() {

		// style element
		var style = dom.create('style');
			style.id = 'grid-styles';
			document.getElementsByTagName('HEAD')[0].appendChild(style);

		// data data data!
		g.CHANNELS_COUNT = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]].length;
		g.VIEWPORT_WIDTH_HOURS = (document.body.clientWidth - g.CHANNEL_BAR_WIDTH) / g.HOUR_WIDTH;
		g.GRID_HEIGHT = g.ROW_HEIGHT * g.CHANNELS_COUNT;
		g.GRID_WIDTH = g.HOUR_WIDTH * 24;

		var cssText = [];
			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('.nav { z-index: 1; } @media screen and (min-width:640px) { .nav { z-index: 100; } }'); // Hack the .nav z-index for the grid
			cssText.push('#grid-container {height:' + g.GRID_HEIGHT + 'px;width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;margin-top:' + g.TIMEBAR_HEIGHT + 'px;}');
			cssText.push('#grid-container .grid-event {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#channels-bar li {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#time-bar-list {width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;}');
			cssText.push('#time-bar-list li {width:' + g.HOUR_WIDTH + 'px;}');
			cssText.push('.channel-container {height:' + g.ROW_HEIGHT + 'px;}');

		// insert styles
		// redraw and reflow here!
		style.innerHTML = cssText.join('\n');

	}

	function removeStyles() {

		var style = document.getElementById('grid-styles');
		document.getElementsByTagName('head')[0].removeChild(style);

	}

	function toggleTimeControls() {
		_gridcontainer.className = (_gridcontainer.className === '') ? 'expanded' : '';
	}

	function handleActions(action, event) {

		if (action === 'TOGGLE-EDIT-MODE') {
			toggleTimeControls();
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

	/* timer functions */
	function timer_start() {
		timer.status = true;
		timer.clock = setTimeout(timer.tick, timer.time);
		return this;
	}

	function timer_run() {
		if (!timer.status) { return; }
		if (typeof _ticker === 'undefined') { return; }
		_ticker.style.left = convert.timeToPixels( (new Date()).valueOf() ) + 'px';
		timer.stop();
		timer.start();
		return this;
	}

	function timer_stop() {
		timer.status = false;
		timer.clock = clearTimeout(timer.clock);
		return this;
	}

/* abstract */

	function initialize() {

		_lang = new Language(App.selectedLanguageCode);

		// UI event handlers
		// every time user scrolls, we want to load new events
		window.addEventListener('resize', handleResizeAndScroll);
				
		window.addEventListener('scroll', handleResizeAndScroll);
				
		window.addEventListener('touchmove', handleResizeAndScroll);

		// Update touch velocity
		window.addEventListener('touchstart', updateTouchVelocity);
				
		window.addEventListener('touchmove', updateTouchVelocity);

		// restoreHeaders
		window.addEventListener('scroll', restoreHeaders);
		
		window.addEventListener('touchstart', restoreHeaders);

		// touch end
		window.addEventListener('touchend', onTouchEnd);

		// The model recieves events
		// we are listening to render new events
		Event.on(g.MODEL_CHANGED, modelChanged);

		// Actions
		Event.on(a.ACTION, handleActions);

		return this;

	}

	function render() {

		drawStyles();

		_gridcontent.appendChild(_gridcontainer);
		
		dom.content.appendChild(_gridcontent);

		// initialize ticker
		timer.start().tick();

		return this;
	}

	function finalize() {

		removeStyles();

		dom.content.removeChild(_gridcontent);

		window.removeEventListener('resize', handleResizeAndScroll);
		
		window.removeEventListener('scroll', handleResizeAndScroll);
				
		window.removeEventListener('touchmove', handleResizeAndScroll);
				
		window.removeEventListener('touchstart', updateTouchVelocity);
				
		window.removeEventListener('touchmove', updateTouchVelocity);
				
		window.removeEventListener('scroll', restoreHeaders);
				
		window.removeEventListener('touchstart', restoreHeaders);
				
		window.removeEventListener('touchend', onTouchEnd);

		Event.off(g.MODEL_CHANGED, modelChanged);

		Event.off(a.ACTION, handleActions);

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
		components			: components
	});

});