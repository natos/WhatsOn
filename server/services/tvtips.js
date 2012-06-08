/**
 *	TVTipsService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// config
	'config/global.config'
],


/**
 *	@class TVTipsService
 */

function(util, events, request, config) {
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
					self.emit('getTVTips', result);
				})

			}

		});

		return this;
	};

	/** @return */

	return TVTipsService;

});