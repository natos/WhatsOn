/**
 *	TVTipsService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// utils
	'utils/dateutils',
	'utils/requestn',

	// config
	'config/global.config'
],


/**
 *	@class TVTipsService
 */

function(util, events, request, DateUtils, requestN, config) {
	'use strict';

	/** @constructor */

	var TVTipsService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(TVTipsService, events.EventEmitter);


	/** @private */

	var _dateUtils = new DateUtils();
	var EVENT_DETAILS_URL = config.API_PREFIX + 'Event/%%id%%.json';
	var _tvTipsCache;
	var _tvTipsCacheTimestamp;

	// The event cache holds a map of event.id:eventdetails,
	// so that we don't always have to retrieve the details for an event.
	var _eventDetailsCache = {};


	/**
	 * The TVTips feed is XML. The xml2js parser turns this
	 * into a simple object. Now we want to take that object,
	 * and turn it into a flattened array of events.
	 */
	var normalizeTVTips = function(tvTips) {
		var normalizedEvents = [],
			normalizedEvent,
			i, j, tvTipsCount, entry, entryLink, entryLinksCount;

		if (tvTips && tvTips.entry && tvTips.entry.length) {
			tvTipsCount = tvTips.entry.length;
			for (i=0; i<tvTipsCount; i++) {
				entry = tvTips.entry[i];
				normalizedEvent = {
					'id' : entry['upcepg:eventid'],
					'startDateTime' : entry['upcepg:startdate'],
					'endDateTime' : entry['upcepg:enddate'],
					'prettyStartTime' : _dateUtils.prettify(entry['upcepg:startdate']),
					'programme' : {
						'title' : entry.title,
						'id' : '', // The TVTips feed does not give us the programme ID for an event!
						'shortDescription' : entry['upcepg:synopsis'],
						'descriptionHtml' : entry.content['#'],
						'imageUrl' : ''
					},
					'channel' : {
						'id' : entry['upcepg:channelid'],
						'name' : entry['upcepg:channel']
					}
				};

				// Find the image
				if (entry.link && entry.link.length) {
					entryLinksCount = entry.link.length;
					for (j=0; j<entryLinksCount; j++) {
						entryLink = entry.link[j];
						if (entryLink['@']['type'] === 'image/jpeg') {
							normalizedEvent.programme.imageUrl = 'http://tvgids.upc.nl' + entryLink['@']['href'];				
						}
					}
				}

				// Skip events that don't have an event ID.
				// (These are generally UPC on-demand events.)
				if (typeof(normalizedEvent.id) === 'string') {
					normalizedEvents.push(normalizedEvent);
				}
			}
		}

		return normalizedEvents;
	};


	/**
	 * Retrieve, normalize, and cache the tv Tips feed.
	 * Raise an event when complete.
	 */
	 var populateTvTipsCache = function(self) {

		// TODO: choose URL (& mock?) from config based on marketId
		var tvTipsUrl = 'http://tvgids.upc.nl/cgi-bin/WebObjects/FeedSniplets.woa/wa/XmlFeedActions/getFeed?groupName=nlTVTips';
		var tvTipsMock = '';

		request(tvTipsUrl, function(error, response, body) {

			// API Error? Grab the mock
			if ( !body || /404|500/.test(response.statusCode) ) {

				// TODO: make this actually work
				self.emit('getTVTips', JSON.parse(tvTipsMock));

			} else {

				var xml2js = require('xml2js');
				var parser = new xml2js.Parser();

				parser.parseString(body, function(err, result){

//var inspect = require('eyes').inspector({maxLength:20000});
//console.log(inspect(result));

					// Normalize the TV tips feed to return events in our "standard" format
					// Note: this will REMOVE events that do not have an event ID.
					var normalizedEvents = normalizeTVTips(result);

					// Get event details (specifically: programme ID) for each event.
					// Note: this will REMOVE events for which we cannot find a programme ID.
					var requestUrls = [];
					for(var i=0; i<normalizedEvents.length; i++) {
						if (!_eventDetailsCache[normalizedEvents[i].id]) {
							requestUrls.push(EVENT_DETAILS_URL.replace(/%%id%%/, normalizedEvents[i].id));
						}
					}

					requestN(requestUrls, function(responses) {
						var i, eventDetails;

						// Store any new event details responses in cache
						for (i=0; i<requestUrls.length; i++) {
							if (!responses[requestUrls[i]].error && responses[requestUrls[i]].response.statusCode == 200) {
								eventDetails = JSON.parse(responses[requestUrls[i]].body);
								_eventDetailsCache[eventDetails.id] = eventDetails;
							}
						}

						// Attach programme ID to normalized events
						var normalizedEventsWithProgrammeIds = [];
						for (i=0; i<normalizedEvents.length; i++) {
							eventDetails = _eventDetailsCache[normalizedEvents[i].id];
							if (eventDetails && eventDetails.programme && eventDetails.programme.id) {
								normalizedEvents[i].programme.id = eventDetails.programme.id;
								normalizedEventsWithProgrammeIds.push(normalizedEvents[i]);
							}
						}

						_tvTipsCache = normalizedEventsWithProgrammeIds;
						_tvTipsCacheTimestamp = new Date();

						self.emit('getTVTips', _tvTipsCache);
					});

				});
			}

		});

	 }

	/** @public */

	/** Get list of TV tips */
	TVTipsService.prototype.getTVTips = function(marketId) {

		var self = this;

		// Use cached tvTips for up to 1 hour
		if (_tvTipsCache && _tvTipsCacheTimestamp && (new Date().valueOf() - _tvTipsCacheTimestamp.valueOf()) < (1000 * 60 * 60)) {
			self.emit('getTVTips', _tvTipsCache);
		} else {
			populateTvTipsCache(self);
		}

		return this;
	};

	/** @return */

	return TVTipsService;

});