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

	var name = 'grid',

/* private */

	_channelVisibilityPrevious = {},
	_channelVisibilityCurrent = {},
	_eventsForChannelCache = {}, // Events cache
	_shadow;

	function createShadow() {

		_shadow = document.createDocumentFragment();

		// grab selected channels from channel model
		var _channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]], i = 0, t = _channels.length, row, div = document.createElement('div');
	
		// iterate channel collection
		for (i; i < t; i++) {
			// create a new channel row for the grid
			row = div.cloneNode(false);
			row.id = 'cc_' + _channels[i].id;
			row.className = "channel-container";
			row.style.top = i * g.ROW_HEIGHT + 'px';

			_shadow.appendChild(row);

		}

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
		var channelSliceCache = GridModel[g.CHANNEL_SLICE_CACHE];
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

		// cloneNode(true) the boolean argument defines
		// if is gonna be a deep clone, including all node children
		// or false, just the selected node
//		GridView.renderShadow(_shadow.cloneNode(true));
		GridModel.set('render', _shadow.cloneNode(true));
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
		var channelSliceCache = GridModel[g.CHANNEL_SLICE_CACHE];
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

		// cloneNode(true) the boolean argument defines
		// if is gonna be a deep clone, including all node children
		// or false, just the selected node
//		GridView.renderShadow(_shadow.cloneNode(true));
		GridModel.set('render', _shadow.cloneNode(true));
	}


	/**
	* Redraw the grid channel-by-channel because new event data has been received.
	* The grid *might* have moved since the last time.
	*
	* Iterate through the channels, and determine what action is required: 
	*  CHANNEL VISIBILITY 
	* PREVIOUS  |  CURRENT  |  ACTION REQUIRED
	*    Y            Y        No change - do not re-render channel
	*    Y            Y        If the events received are for this channel, render the channel. Otherwise, do nothing. 
	*    Y            N        Set channel to blank (#cc.innerHTML = "")
	*    N            Y        Render channel events
	*    N            N        No change - do not re-render channel
	* 
	* @private
	*/

	function redrawGrid(eventsForChannelSlice) {

		_channelVisibilityCurrent = getCurrentChannelVisibility();

		var channelModel = App.models.channel;
		var channelsInGrid = channelModel.groups[channelModel.selected_group];

		// For each channel in the grid, compare its current visibility against the previous visibility
		var channelId, currentVisibility, previousVisibility;
		var channelSliceCache = GridModel[g.CHANNEL_SLICE_CACHE];
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

		// cloneNode(true) the boolean argument defines
		// if is gonna be a deep clone, including all node children
		// or false, just the selected node
		GridModel.set('render', _shadow.cloneNode(true));
	}

	/**
	* Clear an entire channel row
	* @private
	*/
	function blankChannel(channelId) {
		// grab the channel
		var channel = _shadow.querySelectorAll('#cc_' + channelId)[0];
		// iterate and remove all its children
		while (channel.firstChild) { channel.removeChild(channel.firstChild); }
	}


	/**
	* Render a whole channel of EPG events into the grid
	* @private
	*/
	function renderChannel(channelId, channelSliceCache) {

		// Note: the channelSliceCache is undefined until the first data has been received
		if (channelSliceCache) {
			// Get a list of ALL time slices for the grid:
			var timeSlices = EpgApi.getTimeSlices(g.ZERO, g.END), cacheKey, timeSlice, i, events,
				channelRow = document.createDocumentFragment();
			for (i = 0; i < timeSlices.length; i++) {
				timeSlice = timeSlices[i];
				cacheKey = EpgApi.getCacheKey(channelId, timeSlice);
				events = channelSliceCache[cacheKey];
				if (events) {
					channelRow.appendChild(buildEventsForChannelSlice(events));
				}
			}

			// find the channel row and insert the documentFragment
			_shadow.querySelectorAll('#cc_' + channelId)[0].appendChild(channelRow);

		}

	}

	/**
	* Build the HTML for a channel slice of EPG events into the grid.
	* @private
	*/
	function buildEventsForChannelSlice(channelSliceEvents, cacheKey) {

		var i, event, width, left, startDateTime, endDateTime, category, subcategory, right, eventId, programmeId, channelId, eventTitle,
			eventCollection = document.createDocumentFragment(), link = document.createElement('a'), eventElement, ids = [];

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

			programmeId = event.programme.id;
			channelId = event.channel.id;

			if (_shadow.querySelectorAll('#event-' + eventId)[0]) {
				continue;
			}

			// define element
			eventElement = link.cloneNode(false);
			eventElement.id = 'event-' + eventId;
			eventElement.className = 'grid-event';
			eventElement.style.width = width + 'px';
			eventElement.style.left = left + 'px';
			eventElement.innerText = eventTitle;
			eventElement.setAttribute('href', '/programme/' + programmeId);
			eventElement.setAttribute('data-programmeid', programmeId);
			eventElement.setAttribute('data-category', category);
			eventElement.setAttribute('data-subcategory', subcategory);
			eventElement.setAttribute('data-programmeid', programmeId);

			// Insert			
			eventCollection.appendChild(eventElement);

		} // end loop

		return eventCollection;

	}

	function getCurrentChannelVisibility() {

		var channelsInViewport = GridModel[g.SELECTED_CHANNELS],
			channelsInGrid = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]],
			channelVisibility = {},
			channelId;
		
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
		GridModel.set(g.POSITION, { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });
		GridModel.set(g.SELECTED_CHANNELS, GridView.components.channelbar.getSelectedChannels(g.EXTRA_ABOVE_AND_BELOW));
		GridModel.set(g.SELECTED_TIME, GridView.getSelectedTime());

		return this;
	}
	
	/**
	* Handler for the "eventsReceived" event.
	* "eventsReceived" is raised by the EpgApi.js object whenever a batch of EPG data
	* has been retrieved from the API, or from cache.
	*/
	function setEvents(events, cacheKey) {


		_eventsForChannelCache[cacheKey] = events;

		//redrawWithNewData(events);
		redrawGrid(events);

		GridModel.set('events', events);
		GridModel.set(g.CHANNEL_SLICE_CACHE, _eventsForChannelCache);
	
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
		var channels = GridModel[g.SELECTED_CHANNELS],
			startTime = GridModel[g.SELECTED_TIME].startTime,
			endTime = GridModel[g.SELECTED_TIME].endTime,
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

		//redrawWithoutNewData();
		redrawGrid();

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
		App.on(g.EVENTS_RECEIVED, setEvents);

		return this;

	}

	function finalize() {

		App.off(g.GRID_MOVED, gridMoved);
		App.off(g.GRID_FETCH_EVENTS, getEvents);
		App.off(g.EVENTS_RECEIVED, setEvents);

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