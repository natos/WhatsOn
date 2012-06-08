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

	// config
	'config/global.config'
],


/**
 *	@class TVTipsService
 */

function(util, events, request, DateUtils, config) {
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

				normalizedEvents.push(normalizedEvent);
			}
		}

		return normalizedEvents;
	};

	/** @public */

	/** Get list of TV tips */
	TVTipsService.prototype.getTVTips = function(marketId) {

		var self = this;

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

					self.emit('getTVTips', normalizeTVTips(result));
				})

			}

		});

		return this;
	};

	/** @return */

	return TVTipsService;

});