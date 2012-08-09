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
	'utils/cache',

	// config
	'config/global.config'
],


/**
 *	@class TVTipsService
 */

function(util, events, request, DateUtils, requestN, cache, config) {
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

			if ( !body || /404|500/.test(response.statusCode) ) {

				// TODO: what can we return in the case of an api error?
				// For now, just return an empty array (so we don't crash).
				// This empty array is not cached, so we'll retry the api
				// on the next request.
				self.emit('getTVTips', []);

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
						if (!cache.get(normalizedEvents[i].id)) {
							requestUrls.push(EVENT_DETAILS_URL.replace(/%%id%%/, normalizedEvents[i].id));
						}
					}

					requestN(requestUrls, function(responses) {
						var i, eventDetails;

						// Store any new event details responses in cache
						for (i=0; i<requestUrls.length; i++) {
							if (!responses[requestUrls[i]].error && responses[requestUrls[i]].response.statusCode == 200) {
								eventDetails = JSON.parse(responses[requestUrls[i]].body);
								cache.set(eventDetails.id, eventDetails, 3600);
							}
						}

						// Attach programme ID to normalized events
						var normalizedEventsWithProgrammeIds = [];
						for (i=0; i<normalizedEvents.length; i++) {
							eventDetails = cache.get(normalizedEvents[i].id);
							if (eventDetails && eventDetails.programme && eventDetails.programme.id) {
								normalizedEvents[i].programme.id = eventDetails.programme.id;
								normalizedEventsWithProgrammeIds.push(normalizedEvents[i]);
							}
						}

						cache.set('tv-tips-normalized-events-with-programme-ids', normalizedEventsWithProgrammeIds, 3600); // Cache for 1 hour
						self.emit('getTVTips', normalizedEventsWithProgrammeIds);
					});

				});
			}

		});

	};

	/** @public */

	/** Get list of TV tips */
	TVTipsService.prototype.getTVTips = function(marketId) {

		var self = this;

		// Use cached tvTips for up to 1 hour
		var normalizedEventsWithProgrammeIds = cache.get('tv-tips-normalized-events-with-programme-ids');
		if (normalizedEventsWithProgrammeIds) {
			self.emit('getTVTips', normalizedEventsWithProgrammeIds);
		} else {
			populateTvTipsCache(self);
		}

		return this;
	};

	/** @return */

	return TVTipsService;

});