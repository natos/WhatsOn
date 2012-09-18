/**
 *	GridService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// utils
	'utils/cache',

	// config
	'config/global.config'
],


/**
*	@class GridService
*/

function(util, events, request, cache, config) {

	/** @constructor */

	var GridService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(GridService, events.EventEmitter);


	/** @private */

	//constants
	
	/** @public */

	/** Get events for EPG */
	GridService.prototype.getEvents = function(channelsIds, start, end) {

		var self = this,

			COLLECTION = [],

			EVENT_BACH = config.API_PREFIX 
		// get events for services
			+ '/linear/services/' + channelsIds + '/events.json'
		// properties
			+ '?show=start,end,service.id,programme.title'
		// filters
			+ '&maxBatchSize=400&sort=start&start>=' + start + '&end<=' + end;

		// get Batch of events
		function getEventBatch(URL) {

			console.log(URL)

			var partial;

			request(URL, function(error, response, body) {

				// Describe errors
				if (error) {
					console.log('<GridService>','ERROR:', error);
				}

				// Parse string response
				partial = JSON.parse(body);

console.log(partial);

				// save each channel object
				partial.data.forEach(function(item){
					COLLECTION.push(item);
				})

				// check if there more batches to request
				if (partial.nextBatchLink && partial.nextBatchLink.href) {
					console.log('<GridService>','Getting new Batch.','Total events: ', COLLECTION.length);
					// more batches? Recursivly get more 
					getEventBatch(partial.nextBatchLink.href);
				} else {
					console.log('<GridService>','FINISH.','Total events: ', COLLECTION.length);
					//cache.set('event-list', COLLECTION, 3600); // 1 hour
					self.emit('getEvents', COLLECTION);
				}

			});
		}

		// start getting batches
		getEventBatch(EVENT_BACH);

		return this;

	};

	/** @return */

	return GridService;

});