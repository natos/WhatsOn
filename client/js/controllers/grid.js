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
* the way in wich the GridView is notified of all data changes.
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

	// grid slice size
	// 6 hours x 15 channels
	HOURS_PER_SLICE = 6,
	CHANNELS_PER_SLICE = 15,

	// grab selected channels from channel model
	_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]],
	
	// channel group cache
	_channelGroupsMap = {},
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

	// helper functions
	function isObject(obj) { return Object.prototype.toString.call(obj) === '[object Object]'; }
	function isArray(arr) { return Object.prototype.toString.call(arr) === '[object Array]'; }
	function isEmpty(map) { for (var key in map) { if (map.hasOwnProperty(key)) { return false; } } return true; }
	// compares two objects for equality
	// returns true if they are equal
	function isEqual(x, y) {
		var p;
		for (p in x) { if(typeof(y[p])=='undefined') { return false; } }
		for (p in x) {
			if (x[p]) {
				switch(typeof(x[p])) {
					case 'object':
						if (!isEqual(x[p],y[p])) { return false; } 
						break;
					case 'function':
						if (typeof(y[p])=='undefined' || (p != 'equals' && x[p].toString() != y[p].toString())) { return false; }
						break;
					default:
						if (x[p] != y[p]) { return false; }
				}
			} else {
				if (y[p]) { return false; }
			}
		}
		for (p in y) { if(typeof(x[p])=='undefined') { return false; } }
		return true;
	}

	// get the difference between
	// arrays or objects
	function difference(x, y) {

		var i, t, lbl, xc = {}, yc = {}, diff = false;

		if (isArray(x) && isArray(y)) {

			diff = [];

			for (i = 0, t = x.length; i < t; i++) { xc[JSON.stringify(x[i])] = true; }
			for (i = 0, t = y.length; i < t; i++) { yc[JSON.stringify(y[i])] = true; }

			for (lbl in xc) { if (!(lbl in yc)) { diff.push(JSON.parse(lbl)); } }
			for (lbl in yc) { if (!(lbl in xc)) { diff.push(JSON.parse(lbl)); } }

		}

		if (isObject(x) && isObject(y)) {

			diff = {};

			for (lbl in x) { if (!(lbl in y)) { diff[lbl] = x[lbl]; } }
			for (lbl in y) { if (!(lbl in x)) { diff[lbl] = y[lbl]; } }

		}

		return diff;

	}

	// merge two arrays or two objects
	function merge(x, y) {

		var i, t, lbl, xc = {}, yc = {}, merge = false;

		if (isArray(x) && isArray(y)) {
			
			merge = [];
			
			for (i = 0, t = x.length; i < t; i++) { merge.push(x[i]); }
			for (i = 0, t = y.length; i < t; i++) { merge.push(y[i]); }

		}

		if (isObject(x) && isObject(y)) {
			
			merge = {};

			for (lbl in x) { merge[lbl] = x[lbl]; }
			for (lbl in y) { merge[lbl] = y[lbl]; }
		}

		return merge;
	}

	function emptyTheShadow() {
		// empty previous rows
		while (_shadow.firstChild) { _shadow.removeChild(_shadow.firstChild); }
	}

	function getCacheKey(channelId, timeSlice) {
		return channelId + '|' + new Date(timeSlice.start).getUTCHours() + '|' + new Date(timeSlice.end).getUTCHours();
	};

	/**
	* Format a date as a string YYYY-MM-DDTHH:00Z
	* Note that this ignores the minutes part of the date, and
	* always places the formatted date at the top of the hour.
	*
	* @private
	* @return  {string} YYYY-MM-DDTHH:00Z
	*/
	function formatTimeForApiRequest(date) {
		var dt = new Date(date);
		var formattedTime = dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	};

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
		if (changes[c.SELECTED_GROUP]) {
			_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];
			createChannelGroups();
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

	function redrawGrid(cacheKey) {

		renderSlice(cacheKey);


		// cloneNode(true) the boolean argument defines
		// if is gonna be a deep clone, including all node children
		// or false, just the selected node
		GridModel.set('render', _shadow.cloneNode(true));

		return;

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
	* Build the HTML for a channel slice of EPG events into the grid.
	* @private
	*/
	function renderSlice(cacheKey) {

		var _cache = GridModel[g.CHANNEL_SLICE_CACHE],
			events = _cache[cacheKey].data,
			event, i, width, left, right, startDateTimeMilliseconds, endDateTimeMilliseconds, 
			category, subcategory, eventTitle, offset, content, eventElement,
			channelRow, tinyWidthLimit = 50;

		if (!events) {
			console.log('<GridController>', 'renderSlice(cacheKey)','No "data" inside collection.', events);
		}

		for (i = 0; i < events.length; i++) {

			event = events[i];

			channelRow = _channelsInShadow[event.service.id];

			// avoid duplicate events ;)
			if (channelRow.querySelectorAll('#event-' + event.id)[0]) {
				//console.log('duplicated',event.id);
				continue;
			}

			eventTitle = event.programme.title;

			// Time data
			startDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.start);
			endDateTimeMilliseconds = convert.parseApiDateStringAsMilliseconds(event.end);

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

			// Category and subcategory
			//category = event.programme.subcategory.category.name;
			//subcategory = event.programme.subcategory.name;

			// define element
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

			// Insert
			channelRow.appendChild(eventElement);

			// GC
			eventElement = null;
			eventTitle = null;

		} // end loop

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
	function setEvents(events, url) {

		if (!events) {
			console.log('<GridController>', 'setEvents(events)','No "Events" inside collection.');
		}

		/* When events come from API */

		var getChannelsIds = /s-(.)+\/events/gi, // extract channel group
			channelGroup = getChannelsIds.exec(url);
			channelGroup = channelGroup && channelGroup[0].split('/events').join('');

		var e, event, channel, channelId, count, filter, cacheKey, timeSlices = {},
			_cache = GridModel[g.CHANNEL_SLICE_CACHE];

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

		// cache doesn't exist
		if (!_cache[cacheKey]) {
			// save the entire slice
			_cache[cacheKey] = events;
		} else {
			// it is possible that a data slice comes in late, in
			// differents request, and they are async. So we need to
			// check if the cached request, have a 'nextBatchLink'
			// property, and compare it with the actual request URL.
			// If they match to be the same URL, it means that the
			// actual request is the nextBatch and we need to merge
			// events.

			if (_cache[cacheKey].nextBatchLink && _cache[cacheKey].nextBatchLink.href) {
				
				// the API is returning all the filters on the URL,
				// including the callback name of the JSONP, this is
				// messing up with jQuery or Zepto. Is necessaty to
				// remove the callback name from the URL to avoid
				// crashes and empty slots of data.
				var callbackName = /\&callback=jsonp\d+/gi;
				var nextUrl = _cache[cacheKey].nextBatchLink.href.replace(callbackName, '');

				if (nextUrl === url) {
					// here we know the actual request is a nextBatch
					// then is necessary merge events and change
					// the nextBatch property if there is a new one.
					for (var i = 0; i < events.data.length; i += 1) {
						_cache[cacheKey].data.push(events.data[i]);
					}
					// new nextBatchLink? store it and make it fully recursive
					if (events.nextBatchLink && events.nextBatchLink.href) {
						_cache[cacheKey].nextBatchLink = events.nextBatchLink;
					}
				}	
			}
		}

		GridModel.set(g.CHANNEL_SLICE_CACHE, _cache);
			
		// render
		redrawGrid(cacheKey);
		
		return this;
	
	}


	// Helper function that iterates slices data
	// crossing channel groups and time slices.
	// Optional processFunction to manipulate
	// slice data before operations.
	function processSlice(channelGroup, timeSlice, processFunction) {
		var group, e, t, cacheKey;
		for (group in channelGroup) {
			for (e = 0, t = timeSlice.length; e < t; e++) {				
				cacheKey = getCacheKey(group, timeSlice[e]);
				processFunction(cacheKey, group, timeSlice[e]);
			}
		}
	}

	// Iterate all events from a slice
	// and tries to remove it from DOM 
	function blankSlice(cacheKey) {	
		
		var _cache = GridModel[g.CHANNEL_SLICE_CACHE],
			cacheKey, i, t, channelRow, event, slice;

		// no cache available
		if (!_cache) { return; }

		if (_cache && _cache[cacheKey]) { 
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
				}
			}
		}

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

		var _cache = GridModel[g.CHANNEL_SLICE_CACHE],
			removeChannelGroup, removeTimeSlice, channelGroupDifference, timeSliceDifference,
			timeSlicesCount = _currentVisibleTimeSlices.length, e, cacheKey, channel, group, uncachedChannels = [];
	
		// trying to avoid redraws here by understanding if
		// there is a new slice visible on the screen
		if (isEqual(_currentVisibleChannelGroup, _previousVisibleChannelGroup) 
		 && isEqual(_currentVisibleTimeSlices, _previousVisibleTimeSlices)) {
		 	// nothing changed, don't move!
			return this;
		}

		// TODO: find the difference between current and previous to see with slices need to erase.
		channelGroupDifference = difference(_currentVisibleChannelGroup, _previousVisibleChannelGroup);
		timeSliceDifference = difference(_currentVisibleTimeSlices, _previousVisibleTimeSlices);

		/* Delete old events */ 
		// Iterate slices that are not longer visible
		// to erase events from DOM

		// grab time slices that are not current visible
		removeTimeSlice = (timeSliceDifference && timeSliceDifference.length > 0) ?
							timeSliceDifference : _timeSlicesMap;
		// grab channel groups that are not current visible
		removeChannelGroup =  ( !isEmpty(channelGroupDifference) ) ? 
								channelGroupDifference : _channelGroupsMap; 

		// process slices that are not visible
		// after selection, send process to blankSlice
		// to erase nodes from Shadow DOM
		processSlice(removeChannelGroup, removeTimeSlice, blankSlice);


		/* Render new events */
		// For all the visible slices, check if there is
		// data on cache, if not, make a new request to
		// the API 
		processSlice(
			_currentVisibleChannelGroup, 
			_currentVisibleTimeSlices, 
			function(cacheKey, group, timeslice) {
				if (_cache && _cache[cacheKey]) {
					// exists, simple redraw
					redrawGrid(cacheKey);
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

	function createChannelGroupsMap() {

		var allChannels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]],
			channel, map = {}, group = [], id = '';

		var i = 0, t = allChannels.length;

		// make groups channels
		for (i; i < t; i += 1) {
			channel = allChannels[i];			
			group.push(channel);
			id += ((i === 0 || i % CHANNELS_PER_SLICE === 0)?'':',') + channel.id;
			if ((i+1) % CHANNELS_PER_SLICE === 0 || (i+1) === t) {
				map[id] = group.slice();
				id = '';
				group.length = 0;
			}
		}

		return map;
	}

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
		var startSliceIndex = Math.floor(startDate.getHours() / HOURS_PER_SLICE);
		startDate.setHours(startSliceIndex * HOURS_PER_SLICE);

		// Round the end time UP to the next whole hour
		endDate.setMinutes(60);
		endDate.setSeconds(0);
		endDate.setMilliseconds(0);
		var endSliceIndex = Math.ceil(endDate.getHours() / HOURS_PER_SLICE);
		endDate.setHours(endSliceIndex * HOURS_PER_SLICE);

		var timeSlices = [];
		var millisecondsPerSlice = HOURS_PER_SLICE * 60 * 60 * 1000;
		var sliceStart = new Date(startDate.valueOf());
		var sliceEnd = new Date(startDate.valueOf() + millisecondsPerSlice);
		do {
			timeSlices.push({ 
				start: formatTimeForApiRequest(new Date(sliceStart.valueOf())), 
				end: formatTimeForApiRequest(new Date(sliceEnd.valueOf())) 
			});
			sliceStart = new Date(sliceStart.valueOf() + millisecondsPerSlice);
			sliceEnd = new Date(sliceEnd.valueOf() + millisecondsPerSlice);
		} while (sliceEnd <= endDate);

		return timeSlices;
	};
/* public */

/* abstract */

	function initialize() {

		g.ZERO = g.zeroTime;
		g.END = new Date(g.zeroTime.valueOf() + 24*60*60*1000);

		// Map all the grid slices
		// theses maps are used to difference operations
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