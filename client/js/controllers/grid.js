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
	'utils/dom',
	'utils/epgapi'

], function GridController(g, c, App, Controller, GridModel, ChannelModel, GridView, convert, dom, EpgApi) {

	var name = 'grid',

/* private */

	// timer
	gridMoveExecutionTimer,
	gridMoveExecutionDelay = 100,

	// cache
	_channelVisibilityPrevious = {},
	_channelVisibilityCurrent = {},
	_eventsForChannelCache = {}, // Events cache

	// grab selected channels from channel model
	_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]], 

	// builders
	_shadow = dom.create('fragment'),
	_tick = dom.create('div'),

	// map of channel rows references
	// inside shadowdom, we need this
	// references because the DocumentFragment
	// interface doesn't have any element or
	// document API available
	_channelsInShadow = {};

	function emptyTheShadow() {
		// empty previous rows
		while (_shadow.firstChild) { _shadow.removeChild(_shadow.firstChild); }
	}

	function fillTheShadow() {

		// Create shadow DOM
		var i = 0, t = _channels.length, row;
		// iterate channel collection
		for (i; i < t; i++) {
			// create a new channel row for the grid
			row = dom.create('div');
			row.id = 'cc_' + _channels[i].id;
			row.className = "channel-container";
			row.style.top = i * g.ROW_HEIGHT + 'px';
	
			// save reference in a map
			_channelsInShadow[_channels[i].id] = row;
	
			// append to shadowdom
			_shadow.appendChild(row);
	
			// GC
			row = null;
		}
	
		// add the ticker to the shadowdom
		// the ticker shows the "now" time
		_tick.id = 'timer-ticker';
		_shadow.appendChild(_tick);
	}

	function channelModelChanged(changes) {
		console.log(changes);
		if (changes[c.SELECTED_GROUP]) {
			_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];
			emptyTheShadow();
			fillTheShadow();
			GridView.render();
		}
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
	*    Y            N        Set channel to blank
	*    N            Y        Render channel events
	*    N            N        No change - do not re-render channel
	*
	* @private
	*/

	function redrawGrid(eventsForChannelSlice) {

		_channelVisibilityCurrent = getCurrentChannelVisibility();

		var channelModel = App.models.channel;
		var channelsInGrid = channelModel.groups[channelModel.selected_group]; // update here

		// For each channel in the grid, compare its current visibility against the previous visibility
		var channelId, currentVisibility, previousVisibility;
		var channelSliceCache = GridModel[g.CHANNEL_SLICE_CACHE];

		for(var channel in channelsInGrid) {
			// if the channel is selected
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

		// ONLY RENDER IF IS NECESARY

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
		var channel = _channelsInShadow[channelId];
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
			var timeSlices = EpgApi.getTimeSlices(g.ZERO, g.END);
			var cacheKey, timeSlice, i, events;
			for (i = 0; i < timeSlices.length; i++) {
				timeSlice = timeSlices[i];
				cacheKey = EpgApi.getCacheKey(channelId, timeSlice);
				events = channelSliceCache[cacheKey];
				if (events) {
					buildEventsForChannelSlice(channelId, events);
				}
			}
		}
	}

	/**
	* Build the HTML for a channel slice of EPG events into the grid.
	* @private
	*/
	function buildEventsForChannelSlice(channelId, events) {

		var i, event, width, left, right, startDateTimeMilliseconds, endDateTimeMilliseconds, category, subcategory, eventId, programmeId, eventTitle, offset, content, eventElement,
			channelRow = _channelsInShadow[channelId], tinyWidthLimit = 50;

		for (i = 0; i < events.length; i++) {

			event = events[i];
			eventId = event.id;

			// avoid duplicate events ;)
			if (channelRow.querySelectorAll('#event-' + eventId)[0]) {
				//console.log('duplicated');
				continue;
			}

			eventTitle = event.programme.title;

			// Time data
			startDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.startDateTime);
			endDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.endDateTime);

			// size data
			left = convert.timeToPixels(startDateTimeMilliseconds, g.ZERO);
			right = convert.timeToPixels(endDateTimeMilliseconds, g.ZERO);
			width = right - left;

			// avoid events outside view
			if (right < 0) {
				continue;
			}

			// adjust left
			if (left < 0) {
				right = left + width;
				left = 0;
				width = right;
				eventTitle = "←" + event.programme.title;
			}

			// ids
			programmeId = event.programme.id;

			// Category and subcategory
			category = event.programme.subcategory.category.name;
			subcategory = event.programme.subcategory.name;

			// define element
			eventElement = dom.create('a');
			eventElement.id = 'event-' + eventId;
			eventElement.className = 'grid-event' + (width < tinyWidthLimit ? ' tiny' : '');
			eventElement.href = '/programme/' + programmeId;
			eventElement.style.width = width + 'px';
			eventElement.style.left = left + 'px';
			eventElement.setAttribute('data-category', category);
			eventElement.setAttribute('data-subcategory', subcategory);
			if (width >= tinyWidthLimit) {
				eventElement.appendChild(document.createTextNode(eventTitle));
			}

			// Insert
			channelRow.appendChild(eventElement);

			// GC
			eventElement = null;
			eventTitle = null;

		} // end loop

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
		// Update model UI data:

		// Update position immediately; this is used for updating
		// the channelbar and timebar scroll positions
		GridModel.set(g.POSITION, { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });

		// Delay updating the selectedChannels and selectedTime values.
		// We don't need to trigger the dependent events (fetch data)
		// with _every_ onscroll event, especially on slow (Android) devices.

		// erase the previous timer
		if (gridMoveExecutionTimer) { clearTimeout(gridMoveExecutionTimer); }
		// set a delay before rendering the logos
		gridMoveExecutionTimer = setTimeout(changeSelection, gridMoveExecutionDelay);
	
		return this;
	}

	/**
	* Fires gridMoved
	* Saves selected channels, and selected time.
	*/
	function changeSelection() {
		GridModel.set(g.SELECTED_CHANNELS, GridView.components.channelbar.getSelectedChannels(g.EXTRA_ABOVE_AND_BELOW));
		GridModel.set(g.SELECTED_TIME, GridView.getSelectedTime());
	}

	
	/**
	* Handler for the "eventsReceived" event.
	* "eventsReceived" is raised by the EpgApi.js object whenever a batch of EPG data
	* has been retrieved from the API, or from cache.
	*/
	function setEvents(events, cacheKey) {

		var e;

		for (e = 0; e < events.length; e++) {

			delete events[e]._type;
			delete events[e].channel._type;
			delete events[e].channel.name;
			delete events[e].programme._type;
			delete events[e].programme.shortDescription;

			if (events[e].programme.subcategory) {
				delete events[e].programme.subcategory._type;
				delete events[e].programme.subcategory.id;
				delete events[e].programme.subcategory.category._type;
				delete events[e].programme.subcategory.category.id;
			}

			if (events[e].programme.category) {
				delete events[e].programme.category._type;
				delete events[e].programme.category.id;
			}
		}


		_eventsForChannelCache[cacheKey] = events;

		redrawGrid(events);

		GridModel.set(g.CHANNEL_SLICE_CACHE, _eventsForChannelCache); // no need to store this again, you know, memory
	
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

		// for each slice
		for (e = 0; e < slicesCount; e++) {
			// find uncached channels
			uncachedChannels = [];
			for (i = 0; i < channelsCount; i++) {
				// create cachekey
				cacheKey = EpgApi.getCacheKey(channels[i], timeSlices[e]);
				if (_eventsForChannelCache[cacheKey]) {
					//console.log('exist on cache');
					setEvents(_eventsForChannelCache[cacheKey], cacheKey);
				} else {
					//console.log('doesn\' exist on cache');
					uncachedChannels.push(channels[i]);
				}
			}

			// get events for uncached channels with thi
			EpgApi.getEventsForSliceFromApi(uncachedChannels, timeSlices[e]);
		}

		return this;
	}

/* public */

/* abstract */

	function initialize() {

		g.ZERO = g.zeroTime;
		g.END = new Date(g.zeroTime.valueOf() + 24*60*60*1000);

		// fill the shadow DOM
		// with selected channels
		fillTheShadow();

		// Events Handlers
		App.on(g.GRID_MOVED, gridMoved);
		App.on(g.GRID_FETCH_EVENTS, getEvents);
		App.on(g.EVENTS_RECEIVED, setEvents);

		App.on(c.MODEL_CHANGED, channelModelChanged);

		return this;

	}

	function finalize() {

		// this maybe help GC
		// in some cases
		emptyTheShadow();

		App.off(g.GRID_MOVED, gridMoved);
		App.off(g.GRID_FETCH_EVENTS, getEvents);
		App.off(g.EVENTS_RECEIVED, setEvents);

		App.off(c.MODEL_CHANGED, channelModelChanged);

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