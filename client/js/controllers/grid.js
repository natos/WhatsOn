/* 
* GridController 
* --------------
*
* Listen to the views
* Updates the model
*
*/

define([

	'config/grid',
	'config/channel',
	'modules/app',
	'lib/flaco/controller',
	'models/grid',
	'models/channel',
	'views/grid',
	'utils/convert',
	'utils/epgapi',
	'/js/lib/timetrack/timetrack.js'

], function GridController(g, c, App, Controller, GridModel, ChannelModel, GridView, convert, EpgApi) {


	var timer;

	startShowingAverageTime();

	var average_tilnow = 0,
		average_time = 0,
		average_count = 0,
		last_average = 0;

	function startShowingAverageTime() {
		setTimeout(showAverageTime,1000);
	}

	function showAverageTime() {

		setTimeout(showAverageTime,1000);

		if (average_tilnow !== 0 && average_tilnow !== last_average) {
			console.log('Average time <', average_tilnow, 'ms>');
			last_average = average_tilnow;
		}

	}

	function average(time) {
		average_time += time; average_count += 1;
		average_tilnow = Math.ceil(average_time / average_count);
	}

	App.on(g.GRID_RENDERED, function() { 
		/* for performance tests */
		timer.track('Render');
		// Average time to test Jedrzej API performance
		average(timer.timeDiff);
		/* for performance tests */
	});



	var name = 'grid',

/* private */

	_channelVisibilityPrevious = {},
	_channelVisibilityCurrent = {},
	_eventsForChannelCache = {}, // Events cache
	_shadow;

	function createShadow() {

		_shadow = $('<div>').attr('id','shadow');

		// grab selected channels from channel model
		_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]], i = 0, t = _channels.length, rows = [];
	
		// iterate channel collection
		for (i; i < t; i++) {
			// create a new channel row for the grid
			rows.push('<div class="channel-container" id="cc_' + _channels[i].id + '" style="top:' + (i * g.ROW_HEIGHT) + 'px"></div>');
		}

		_shadow.html(rows.join(''));

	}

	/**
	* Redraw the grid channel-by-channel because the user has moved the grid.
	* No new event data has been received.
	*
	* Iterate through the channels, and determine what action is required: 
	*  CHANNEL VISIBILITY 
	* PREVIOUS  |  CURRENT  |  ACTION REQUIRED
	*    Y            Y        No change - do not re-render channel
	*    Y            N        Set channel to blank (#cc.innerHTML = "")
	*    N            Y        Render channel events
	*    N            N        No change - do not re-render channel
	* 
	* @private
	*/
	function redrawWithoutNewData() {

		_channelVisibilityCurrent = getCurrentChannelVisibility();

		var channelModel = App.models.channel;
		var channelsInGrid = channelModel.groups[channelModel.selected_group];

		// For each channel in the grid, compare its current visibility against the previous visibility
		var channelId, currentVisibility, previousVisibility;
		var channelSliceCache = GridModel['channelSliceCache'];
		for(var channel in channelsInGrid) {
			if (channelsInGrid.hasOwnProperty(channel)) {
				channelId = channelsInGrid[channel].id;
				currentVisibility = _channelVisibilityCurrent[channelId];
				previousVisibility = _channelVisibilityPrevious[channelId];
				// We only have to take action if the visibility has changed
				if (previousVisibility !== currentVisibility) { // N + Y, or Y + N
					if (currentVisibility) { // N + Y
						// render channel
						renderChannel(channelId, channelSliceCache);
					} else {  // Y + N
						// set channel blank
						blankChannel(channelId);
					}
				}
			}
		}

		_channelVisibilityPrevious = _channelVisibilityCurrent;

		//GridModel.set('render', _shadow.html());
		GridView.renderShadow(_shadow.html());
	}

	/**
	* Redraw the grid channel-by-channel because new event data has been received.
	* The grid *might* have moved since the last time.
	*
	* Iterate through the channels, and determine what action is required: 
	*  CHANNEL VISIBILITY 
	* PREVIOUS  |  CURRENT  |  ACTION REQUIRED
	*    Y            Y        If the events received are for this channel, render the channel. Otherwise, do nothing. 
	*    Y            N        Set channel to blank (#cc.innerHTML = "")
	*    N            Y        Render channel events
	*    N            N        No change - do not re-render channel
	* 
	* @private
	*/
	function redrawWithNewData(eventsForChannelSlice) {

		_channelVisibilityCurrent = getCurrentChannelVisibility();

		var channelModel = App.models.channel;
		var channelsInGrid = channelModel.groups[channelModel.selected_group];

		// For each channel in the grid, compare its current visibility against the previous visibility
		var channelId, currentVisibility, previousVisibility;
		var channelSliceCache = GridModel['channelSliceCache'];
		for(var channel in channelsInGrid) {
			if (channelsInGrid.hasOwnProperty(channel)) {
				channelId = channelsInGrid[channel].id;
				currentVisibility = _channelVisibilityCurrent[channelId];
				previousVisibility = _channelVisibilityPrevious[channelId];

				if (previousVisibility && currentVisibility) { // Y + Y
					// render channel ONLY IF the events for slice are for the current channel
					if (eventsForChannelSlice && eventsForChannelSlice.length>0 && eventsForChannelSlice[0].channel.id===channelId) {
						renderChannel(channelId, channelSliceCache);
					}
				} else if (previousVisibility && !currentVisibility) { // Y + N
					// set channel blank
					blankChannel(channelId);
				} else if (!previousVisibility && currentVisibility) { // N + Y
					// render channel
					renderChannel(channelId, channelSliceCache);
				} else { // N + N
					// do nothing
				}
			}
		}
		
		_channelVisibilityPrevious = _channelVisibilityCurrent;

		//GridModel.set('render', _shadow.html());
		GridView.renderShadow(_shadow.html());
	}

	/**
	* Clear an entire channel row
	* @private
	*/
	function blankChannel(channelId) {
		_shadow.find('#cc_' + channelId).html('');
	}


	/**
	* Render a whole channel of EPG events into the grid
	* @private
	*/
	function renderChannel(channelId, channelSliceCache) {

		timer = new Timer('Render Events for Grid Time Track').off();

		// Note: the channelSliceCache is undefined until the first data has been received
		if (channelSliceCache) {
			// Get a list of ALL time slices for the grid:
			var timeSlices = EpgApi.getTimeSlices(g.ZERO, g.END);
			var cacheKey, timeSlice, i, events;
			var channelContent = "";
			for (i=0; i< timeSlices.length; i++) {
				timeSlice = timeSlices[i];
				cacheKey = EpgApi.getCacheKey(channelId, timeSlice);
				events = channelSliceCache[cacheKey];
				if (events) {
					channelContent += buildEventsForChannelSlice(events);
				}
			}
			_shadow.find('#cc_' + channelId).html(channelContent);
		}

	}

	/**
	* Build the HTML for a channel slice of EPG events into the grid.
	* @private
	*/
	function buildEventsForChannelSlice(channelSliceEvents, cacheKey) {

		var i, event, width, left, startDateTime, endDateTime, category, subcategory, right, eventId, programmeId, channelId, eventTitle;

		var eventContent = "";

		for (i = 0; i < channelSliceEvents.length; i++) {

			event = channelSliceEvents[i];
			eventId = event.id;

			// Time data
			startDateTime = convert.parseApiDate(event.startDateTime);
			endDateTime = convert.parseApiDate(event.endDateTime);

			// Category and subcategory
			category = event.programme.subcategory.category.name;
			subcategory = event.programme.subcategory.name;

			width = convert.timeToPixels(endDateTime, startDateTime);
			left = convert.timeToPixels(startDateTime, g.ZERO);
			eventTitle = event.programme.title;
			if (left < 0) {
				right = left + width;
				left = 0;
				width = right;
				eventTitle = "←" + event.programme.title;
			}

			// Insert into DOM
			programmeId = event.programme.id;
			channelId = event.channel.id;

			eventContent += '<a href="/programme/' + programmeId + '" data-programmeid="' + programmeId + '" class="grid-event" data-category="' + category + '" data-subcategory="' + subcategory + '" id="event-' + eventId + '" style="width:' + width + 'px;left:' + left + 'px">' + eventTitle + '</a>';

		} // end loop

		return eventContent;

	}

	function getCurrentChannelVisibility() {
		var channelsInViewport = GridView.getSelectedChannels(g.EXTRA_ABOVE_AND_BELOW);
		var channelModel = App.models.channel;
		var channelsInGrid = channelModel.groups[channelModel.selected_group];

		var channelVisibility = {};
		var channelId;
		
		// For each channel in the grid, add an entry to the channelVisibility hash,
		// with a true/false value to represent its visibility.
		// Example: {"6x":true,"7y":true,"7s":false, ...}
		for(var channel in channelsInGrid) {
			if (channelsInGrid.hasOwnProperty(channel)) {
				channelId = channelsInGrid[channel].id;
				channelVisibility[channelId] = (channelsInViewport.indexOf(channelId) >= 0);
			}
		}

		return channelVisibility;
	}

	/**
	* Handler for the GRID_MOVED event.
	* GRID_MOVED is raised by the grid view whenever the visible channel range
	* or time window changes.
	*/
	function gridMoved() {
		// Update model UI data
		GridModel.set('position', { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });
		GridModel.set('selectedChannels', GridView.getSelectedChannels(2));
		GridModel.set('selectedTime', GridView.getSelectedTime());

		return this;
	}
	
	/**
	* Handler for the "eventsReceived" event.
	* "eventsReceived" is raised by the EpgApi.js object whenever a batch of EPG data
	* has been retrieved from the API, or from cache.
	*/
	function setEvents(events, cacheKey) {


		_eventsForChannelCache[cacheKey] = events;

		redrawWithNewData(events);

		GridModel.set('events', events);
		GridModel.set('channelSliceCache', _eventsForChannelCache);
	
		return this;
	
	}

	/**
	* Handler for the GRID_FETCH_EVENTS event.
	* GRID_FETCH_EVENTS is raised by the grid view at the *end* of a resize or scroll
	* action, to indicate that the user has finished their immediate interaction,
	* and we should now retrieve grid data.
	*/
	function getEvents() {

		// get slices
		var channels = GridModel.selectedChannels,
			startTime = GridModel.selectedTime.startTime,
			endTime = GridModel.selectedTime.endTime,
			timeSlices = EpgApi.getTimeSlices(startTime, endTime),
			slicesCount = timeSlices.length,
			channelsCount = channels.length,
			i, e, cacheKey, 
			uncachedChannels;

		// create cachekey
		for (e=0; e<slicesCount; e++) {
			uncachedChannels = [];
			for (i=0; i<channelsCount; i++) {
				cacheKey = EpgApi.getCacheKey(channels[i], timeSlices[e]);
				if (_eventsForChannelCache[cacheKey]) {
					//console.log('exist on cache');
					// render it
					// render map with stuff
					setEvents(_eventsForChannelCache[cacheKey], cacheKey);
				} else {
					//console.log('doesn\' exist on cache');
//					_eventsForChannelCache[cacheKey] = true;
					uncachedChannels.push(channels[i]);
				}
			}
			// get events for uncached channels with thi
			EpgApi.getEventsForSliceFromApi(uncachedChannels, timeSlices[e]);
		}

		redrawWithoutNewData();
	
		return this;
	}

/* public */

/* abstract */

	function initialize() {

		if (!_shadow) {
			createShadow();
		}

		// Events Handlers
		App.on(g.GRID_MOVED, gridMoved);
		App.on(g.GRID_FETCH_EVENTS, getEvents);
		App.on('eventsReceived', setEvents); // NS: don't like this string there…

		return this;

	}

	function finalize() {

		App.off(g.GRID_MOVED, gridMoved);
		App.off(g.GRID_FETCH_EVENTS, getEvents);
		App.off('eventsReceived', setEvents); // NS: don't like it here either…

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		model		: GridModel,
		view		: GridView
	});

});