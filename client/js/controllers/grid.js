/* 
* GridController 
* --------------
*
* The GridController is in charge of every data change on the
* Grid. Every time the GridView is moved by user interaction,
* it triggers an event called 'GRID_MOVED', then the GridCon-
* troller uses some timers to decide when is the best time to
* change GridModel's data. 
* GridController uses a DocumentFragment (also knwon as _shadow)
* as a render tree in memory, to store events data. Also uses
* the DocumentFragment, to calculate visibles areas on the
* device's viewport and keep the DOM tree clean of invisible
* data. Every time the DocumentFragment is modified, is saved
* on the GridModel, triggering a MODEL_CHANGE event. That's
* the way in which the GridView is notified of all data changes.
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
	'utils/common',
	'utils/dom',
	'utils/epgapi'

], function GridController(g, c, App, Controller, GridModel, ChannelModel, GridView, convert, common, dom, EpgApi) {

	var name = 'grid',

/* private */

	// timer
	gridMoveExecutionTimer,
	gridMoveExecutionDelay = 100,

	// grab selected channels from channel model
	_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]],
	
	// channel group cache
	_channelGroupsMap,
	_timeSlicesMap,

	// current visible slice map
	_currentVisibleChannelGroup = {},
	_currentVisibleTimeSlices = {},

	// previous visible slice map
	_previousVisibleChannelGroup = {},
	_previousVisibleTimeSlices = {},
	
	// DOM builders
	_shadow = dom.create('fragment'),
	_tick = dom.create('div'),

	// channel rows containers reference,
	// the DocumentFragment doesn't have
	// element or document API available
	// we use this map to quick find rows
	// inside the shadow DOM
	_channelsInShadow = {};
	// The grid is divided into slices,
	// squares defined by a timeslice and
	// a channel group. To fill gaps between
	// slices, theres some duplicated events
	// on the slices joints. This map help
	// to quickly avoid render duplicated
	// events.
	_eventsInShadow = {};


	/**********************
	 	   SHADOW DOM
	 **********************/

	// removes all the nodes from
	// the shadow render tree
	function emptyTheShadow() {
		// empty previous rows
		while (_shadow.firstChild) { _shadow.removeChild(_shadow.firstChild); }
	}

	// creates the channel containers
	// and the time ticker
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


	/**********************
			SLICES
	 **********************/

	// Saves selected channels and selected  
	// time slice into the GridModel when
	// user stop moving, see gridMoved()
	function changeSlideSelection() {
		GridModel.set(g.SELECTED_CHANNELS, GridView.components.channelbar.getSelectedChannels(g.EXTRA_ABOVE_AND_BELOW));
		GridModel.set(g.SELECTED_TIME, GridView.getSelectedTime());
	}

	// Given channelId and a time slice, it
	// returns a generated CacheKey for a
	// specific slice of the grid.
	// @return String
	function getCacheKey(channelId, timeSlice) {
		return channelId + '|' + new Date(timeSlice.start).getUTCHours() + '|' + new Date(timeSlice.end).getUTCHours();
	};

	// Helper function that iterates slices data
	// crossing channel groups and time slices.
	// Also recieves an optional argument
	// 'processFunction' to manipulate slice data
	// before operations.
	function processSlice(channelGroup, timeSlice, processFunction) {
		var group, e, t, cacheKey;
		for (group in channelGroup) {
			for (e = 0, t = timeSlice.length; e < t; e++) {				
				cacheKey = getCacheKey(group, timeSlice[e]);
				processFunction(cacheKey, group, timeSlice[e]);
			}
		}
	}

	/**
	* Build the HTML for a grid slice of EPG events into the grid.
	* @private
	*/
	function renderSlice(cacheKey) {

		var _cache = GridModel[g.SLICE_CACHE],
			events = _cache[cacheKey].data,
			event, i, t, width, left, right, startDateTimeMilliseconds, endDateTimeMilliseconds, 
			category, subcategory, eventTitle, offset, content, eventElement,
			channelRow, tinyWidthLimit = 50;

		if (!events) {
			console.log('<GridController>', 'renderSlice(' + cacheKey + ')','No "data" inside collection.', events);
		}

		for (i = 0, t = events.length; i < t; i++) {

			event = events[i];

			// if the event exist on the map, means
			// that it was already rendered by another
			// slice.
			if (_eventsInShadow[event.id]) { continue; }

			// Save the event on the map
			_eventsInShadow[event.id] = event;

			// grab the channelRow reference
			channelRow = _channelsInShadow[event.service.id];
			eventTitle = event.programme.title;

			// Get raw time data
			startDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.start);
			endDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.end);

			// Convert time data into size data
			left = convert.timeToPixels(startDateTimeMilliseconds, g.ZERO);
			right = convert.timeToPixels(endDateTimeMilliseconds, g.ZERO);
			width = right - left;

			// avoid events outside view
			if (right < 0) { continue; }

			// adjust left
			if (left < 0) {
				right = left + width;
				left = 0;
				width = right;
				eventTitle = "←" + event.programme.title;
			}

			/* 
				TODO: API doesn't give any categroy information yet
			*/
			// Category and subcategory
			//category = event.programme.subcategory.category.name;
			//subcategory = event.programme.subcategory.name;

			// define node element
			eventElement = dom.create('a');
			eventElement.id = 'event-' + event.id;
			eventElement.className = 'grid-event' + (width < tinyWidthLimit ? ' tiny' : '');
			eventElement.href = '/programme/' + event.programme.id;
			eventElement.style.width = width + 'px';
			eventElement.style.left = left + 'px';
			//eventElement.setAttribute('data-category', category.replace('/','-')); // the '/' is not interperted by CSS, needed for highlighting
			//eventElement.setAttribute('data-subcategory', subcategory.replace('/','-')); // the '/' is not interperted by CSS, needed for highlighting
			if (width >= tinyWidthLimit) {
				eventElement.appendChild(document.createTextNode(eventTitle));
			} else {
				eventElement.title = eventTitle;
			}

			// Insert event element into channelRow
			channelRow.appendChild(eventElement);

			// GC
			left = null;
			right = null;
			width = null;
			eventElement = null;
			eventTitle = null;
			startDateTimeMilliseconds = null;
			endDateTimeMilliseconds = null;

		} // end loop
		
		// Finish rendering, send the shawdor DOM to the model,
		// uses cloneNode(true), the boolean argument defines
		// if is gonna be a deep clone, including all children
		// nodes or false, just the selected node.
		// Then the model will fire a 'MODEL_CHANGED' and the
		// view will update its template with the new data.
		GridModel.set('render', _shadow.cloneNode(true));

	}

	// Iterate all events from a slice
	// and tries to remove it from DOM 
	function blankSlice(cacheKey) {	

		var _cache = GridModel[g.SLICE_CACHE],
			cacheKey, i, t, channelRow, event, slice;

		// no cache available
		if (!_cache) { return; }

		// check if the slice exists
		if (_cache[cacheKey]) { 
			// grab slice from cache
			slice = _cache[cacheKey];
			// itearate all its events
			for (i = 0, t = slice.data.length; i < t; i++) {
				// select event
				event = slice.data[i];
				// identify channelRow on Shadow DOM
				channelRow = _channelsInShadow[event.service.id];
				// check if exist on the tree
				if (channelRow.querySelectorAll('#event-' + event.id)[0]) {
					// erase the node from the Shadow DOM
					channelRow.removeChild(channelRow.querySelectorAll('#event-' + event.id)[0]);
					// wipe the map
					_eventsInShadow[event.id] = null;
				}
			}
		}
	}

	// Creates and returns a map of all possible channel groups
	// dividing slices according with CHANNELS_PER_SLICE constant.
	// @return Object
	function createChannelGroupsMap() {

		var allChannels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]],
			channel, map = {}, group = [], id = '';

		var i = 0, t = allChannels.length;

		// make groups channels
		for (i; i < t; i += 1) {
			channel = allChannels[i];			
			group.push(channel);
			id += ((i === 0 || i % g.CHANNELS_PER_SLICE === 0)?'':',') + channel.id;
			if ((i+1) % g.CHANNELS_PER_SLICE === 0 || (i+1) === t) {
				map[id] = group.slice();
				id = '';
				group.length = 0;
			}
		}

		return map;
	}

	// Gets the channel groups that are currently visible
	// to the user. 
	// @return Object
	function getSelectedChannelGroups() {

		var selectedChannels = GridModel[g.SELECTED_CHANNELS],
			selectedGroups = {}, 
			channelId;

		for (var i = 0; i < selectedChannels.length; i += 1) {
			channelId = selectedChannels[i];
			for (group in _channelGroupsMap) {
				if (group.indexOf(channelId) > -1) {
					selectedGroups[group] = _channelGroupsMap[group];
				}
			}
		}

		return selectedGroups;
	}


	// Gets all the timeSlices that are currently visible
	// to the user. If no arguments sended, will read the
	// SELECTED_TIME from the GridModel.
	// @return Array
	var getSelectedTimeSlices = function(start, end) {
		
		start = start || GridModel[g.SELECTED_TIME].startTime;
		end = end || GridModel[g.SELECTED_TIME].endTime;

		// Time slices: each slice is HOURS_PER_SLICE hours wide.
		// If HOURS_PER_SLICE = 4, then the slices are:
		// [
		//		00:00 - 04:00,
		//		04:00 - 08:00,
		//		08:00 - 12:00,
		//		...
		// ]

		// Take copies of the startDate and endDate input so we don't modify the original
		// input values by reference:
		var startDate = new Date(start.valueOf());
		var endDate = new Date(end.valueOf());

		// Adjust the start and end dates, so that they align with slice boundaries.

		// Round the start date DOWN to the last whole hour
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		startDate.setMilliseconds(0);
		var startSliceIndex = Math.floor(startDate.getHours() / g.HOURS_PER_SLICE);
		startDate.setHours(startSliceIndex * g.HOURS_PER_SLICE);

		// Round the end time UP to the next whole hour
		endDate.setMinutes(60);
		endDate.setSeconds(0);
		endDate.setMilliseconds(0);
		var endSliceIndex = Math.ceil(endDate.getHours() / g.HOURS_PER_SLICE);
		endDate.setHours(endSliceIndex * g.HOURS_PER_SLICE);

		var timeSlices = [];
		var millisecondsPerSlice = g.HOURS_PER_SLICE * 60 * 60 * 1000;
		var sliceStart = new Date(startDate.valueOf());
		var sliceEnd = new Date(startDate.valueOf() + millisecondsPerSlice);
		do {
			timeSlices.push({ 
				start: convert.formatTimeForApiRequest(new Date(sliceStart.valueOf())), 
				end: convert.formatTimeForApiRequest(new Date(sliceEnd.valueOf())) 
			});
			sliceStart = new Date(sliceStart.valueOf() + millisecondsPerSlice);
			sliceEnd = new Date(sliceEnd.valueOf() + millisecondsPerSlice);
		} while (sliceEnd <= endDate);

		return timeSlices;
	};


	/**********************
	 		EVENTS
	 **********************/
	
	/**
	* Handler for the "eventsReceived" event.
	* "eventsReceived" is raised by the EpgApi.js object whenever a batch of EPG data
	* has been retrieved from the API, or from cache.
	*/
	function setEvents(events, url) {

		if (!events) {
			console.log('<GridController>', 'setEvents(events)','No "Events" inside collection.');
		}

		/* When events come from API */
		var i, e, t, l, event, channel, channelId, count, filter, cacheKey, timeSlices = {}, cachedSlice,
			_cache = GridModel[g.SLICE_CACHE],
			getChannelsIds = /s-(.)+\/events/gi, // extract channel group
			channelGroup = getChannelsIds.exec(url);
			channelGroup = channelGroup && channelGroup[0].split('/events').join('');


		// snif the time filter
		if (events.filter && events.filter.length) {
			for (e = 0; e < events.filter.length; e++) {
				filter = events.filter[e];
				// inverted start end times
				if (/start/.test(filter)) { timeSlices.end = filter.split(' ')[2]; }
				if (/end/.test(filter)) { timeSlices.start = filter.split(' ')[2]; }
			}
		}

		cacheKey = getCacheKey(channelGroup, timeSlices);

		// create a empty object
		if (!_cache) { _cache = {}; }

		// it doesn't exist on cache
		if (!_cache[cacheKey]) {
			// save the entire slice
			_cache[cacheKey] = events;
		} else {
			cachedSlice = _cache[cacheKey];
			// it is possible that a data slice comes in late, in
			// differents request, and they are async. So we need to
			// check if the cached request, have a 'nextBatchLink'
			// property, and compare it with the actual request URL.
			// If they match to be the same URL, it means that the
			// actual request is the nextBatch and we need to merge
			// events.
			if (cachedSlice.nextBatchLink && cachedSlice.nextBatchLink.href) {
				// the API is returning all the filters on the URL,
				// including the callback name of the JSONP, this is
				// messing up with jQuery or Zepto. Is necessaty to
				// remove the callback name from the URL to avoid
				// crashes and empty slots of data.
				var callbackName = /\&callback=jsonp\d+/gi;
				var nextUrl = cachedSlice.nextBatchLink.href.replace(callbackName, '');
				var exists = false;

				if (nextUrl === url) {
					// here we know the actual request is a nextBatch
					// then is necessary merge events and change
					// the nextBatch property if there is a new one.
					for (i = 0, t = events.data.length; i < t; i++) {
						cachedSlice.data.push(events.data[i]); 
					}

					// new nextBatchLink? store it and make it fully recursive,
					// on the next request, it will be used for comparison.
					if (events.nextBatchLink && events.nextBatchLink.href) {
						cachedSlice.nextBatchLink = events.nextBatchLink;
					}
				}	
			}
		}

		// Save the cache
		GridModel.set(g.SLICE_CACHE, _cache);
			
		// Render the slice
		renderSlice(cacheKey);

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
		_currentVisibleChannelGroup = getSelectedChannelGroups();
		_currentVisibleTimeSlices = getSelectedTimeSlices();

		var _cache = GridModel[g.SLICE_CACHE],
			channelGroupDifference, timeSliceDifference,
			removeChannelGroup, removeTimeSlice,
			e, cacheKey, channel, group, uncachedChannels = [];
	
		// trying to avoid redraws here by understanding if
		// there is a new slice visible on the screen
		if (common.isEqual(_currentVisibleChannelGroup, _previousVisibleChannelGroup) 
		 && common.isEqual(_currentVisibleTimeSlices, _previousVisibleTimeSlices)) {
		 	// nothing changed, don't move!
			return this;
		}

		// DOM performance is pretty bad, in order to improve performance,
		// the grid removes the nodes that are not longer visible to the user. 
		// The grid need to know the difference between current and previous
		// channels and times, to decide which slice needs to be erased.
		channelGroupDifference = common.difference(_currentVisibleChannelGroup, _previousVisibleChannelGroup);
		timeSliceDifference = common.difference(_currentVisibleTimeSlices, _previousVisibleTimeSlices);


		/* Delete old events */ 

		// Grab timeslices that are not current visible. If there is no
		// timeSliceDifference, means that the user didn't change the time
		// selection, so instead of using the difference between current
		// and previous, use all timeSlices.
		removeTimeSlice = (timeSliceDifference && timeSliceDifference.length > 0) ?	timeSliceDifference : _timeSlicesMap,
		// Grab channel groups that are not current visible. If there is
		// no channelGroupDifference, means that the user didn't change
		// channel selection, just time, so instead of using the difference
		// between current and previous, use all channel groups.
		removeChannelGroup = (!common.isEmpty(channelGroupDifference)) ? channelGroupDifference : _channelGroupsMap,

		// Iterate slices that are not longer
		// visible to erase events from DOM
		processSlice(
			removeChannelGroup,
			removeTimeSlice,
			// Process slices that are not visible
			// after selection, send process to blankSlice
			// to erase DOM nodes from Shadow
			blankSlice);


		/* Render new events */

		// For all the visible slices, check if there is
		// data on cache, if not, make a new request to
		// the API requesting more data for the current
		// visuble slices.
		processSlice(
			_currentVisibleChannelGroup, 
			_currentVisibleTimeSlices, 
			function(cacheKey, group, timeslice) {
				if (_cache && _cache[cacheKey]) {
					// data exists, simple redraw
					renderSlice(cacheKey);
				} else {
					// get events Batch from API
					EpgApi.getEventBatchFromAPI(group, timeslice);
				}
		});

		// save visible channels and timeslices for the next move
		_previousVisibleChannelGroup = _currentVisibleChannelGroup;
		_previousVisibleTimeSlices = _currentVisibleTimeSlices;

		return this;

	}


	/**********************
		EVENT HANDLERS
	**********************/

	// If the channel selection is changed
	// this function will be re-rendering
	// the grid.
	function channelModelChanged(changes) {
		if (changes[c.SELECTED_GROUP]) {
			_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];
			createChannelGroups();
			emptyTheShadow();
			fillTheShadow();
			GridView.render();
		}
	}

	/**
	* Handler for the GRID_MOVED event.
	* GRID_MOVED is raised by the grid view whenever the visible channel range
	* or time window changes.
	*/
	function gridMoved() {

		// Update position immediately; this is used for updating
		// the channelbar and timebar scroll positions
		GridModel.set(g.POSITION, { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });

		// Delay updating the selectedChannels and selectedTime values.
		// We don't need to trigger the dependent events (fetch data)
		// with _every_ onscroll event, especially on slow (Android) devices.

		// erase the previous timer
		if (gridMoveExecutionTimer) { clearTimeout(gridMoveExecutionTimer); }
		// set a delay before rendering the logos
		gridMoveExecutionTimer = setTimeout(changeSlideSelection, gridMoveExecutionDelay);
	
		return this;
	}


/* public */

	function initialize() {

		g.ZERO = g.zeroTime;
		g.END = new Date(g.zeroTime.valueOf() + 24*60*60*1000); // 24hs

		// Map all the grid slices
		// theses maps are used on difference operations
		// with selected channel groups and time slices
		_timeSlicesMap = getSelectedTimeSlices(g.ZERO, g.END);
		_channelGroupsMap = createChannelGroupsMap();

		// fill the Shadow DOM
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