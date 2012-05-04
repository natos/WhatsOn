/**
 *	NowAndNextController
 */

define([

	/** @require */

	// services
	'services/nowandnext',

	// utils
	'utils/metadata',

	'querystring',
	'config/global.config'

],


/**
 *	@class NowAndNextController
 */

function(NowAndNextService, Metadata, QS, config) {

	/** @constructor */

	var NowAndNextController = function(app) {

		_app = app;

		// Routing

		app.server.get('/nowandnext', this.render);
		app.server.get('/list', this.render); // backwards compatibility

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		nowAndNextService = new NowAndNextService(),

		LIST_TYPE_ALL = 'ALL',
		LIST_TYPE_POP = 'POP',
		LIST_TYPE_FAV = 'FAV',

		ALLOWED_LIST_TYPES = [LIST_TYPE_ALL, LIST_TYPE_POP, LIST_TYPE_FAV],

		DEFAULT_LIST_TYPE = LIST_TYPE_POP;

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// Note that we ignore that MINUTES of the specified time, so that we
	// always ask the EPG api for data starting at the top of each hour.
	var getFormattedSliceStartTime = function(dt) {
		return dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00Z';
	};

	// TODO: Implement popular channels per country
	var getPopularChannels = function(countryId) {
		return ['7J', '6s', '7G'];
	}

	// TODO: Use Date.parse() for simpler way of parsing date in query string?
	// (Check timezone handling.)
	var getDateFromQueryString = function(req) {
		var dt,
			dtString = req.query['dt'],
			parts,
			dateParts,
			timeParts;

		try {
			parts = dtString.split('T');
			dateParts = parts[0].split('-');
			timeParts = parts[1].split(':');
			dt = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], 0);
			if (isNaN(dt.getFullYear())) {
				throw (new Exception('','unable to construct date'));
			}
		}
		catch (err) {
			dt = new Date();
			dt.setMinutes(0);
			dt.setSeconds(0);
		}
		return dt;
	};

	var getListTypeFromQueryString = function(req) {
		var type = DEFAULT_LIST_TYPE,
			typeString = req.query['type'],
			typeIndex;

		if (typeof typeString === 'string') {
			typeIndex = ALLOWED_LIST_TYPES.indexOf(typeString.toUpperCase());
			if (typeIndex >= 0) {
				type = ALLOWED_LIST_TYPES[typeIndex];
			}
		}

		return type;
	};

	var getChannelIdsFromQueryString = function(req) {
		var channelIds = [],
			channelsString = req.query['channels'];

		if (typeof(channelsString) === 'string' && channelsString.length > 0) {
			// Channels expected in format '7J|6s|7G'
			channelIds = channelsString.split('|');
		}

		return channelIds;
	};

	/** @public */

	NowAndNextController.prototype.render = function(req, res) {

		var dt = getDateFromQueryString(req),
			listType = getListTypeFromQueryString(req),
			channelIds,
			dtPreviousSlice = new Date(dt.valueOf() - (60 * 60 * 1000)),
			dtNextSlice = new Date(dt.valueOf() + (60 * 60 * 1000)),
			popUrl = '?dt=' + getFormattedSliceStartTime(dt) + '&type=pop',
			allUrl = '?dt=' + getFormattedSliceStartTime(dt) + '&type=all',
			favUrl,
			earlierUrl = '?dt=' + getFormattedSliceStartTime(dtPreviousSlice),
			laterUrl = '?dt=' + getFormattedSliceStartTime(dtNextSlice),
			strftime = require('prettydate').strftime;

		if (listType == LIST_TYPE_ALL) {
			channelIds = null;
			earlierUrl += '&type=' + LIST_TYPE_ALL;
			laterUrl += '&type=' + LIST_TYPE_ALL;
		} else if (listType == LIST_TYPE_POP) {
			channelIds = getPopularChannels('NL');
			earlierUrl += '&type=' + LIST_TYPE_POP;
			laterUrl += '&type=' + LIST_TYPE_POP;
		} else {
			channelIds = getChannelIdsFromQueryString(req);
			earlierUrl += '&type=' + LIST_TYPE_FAV + '&channels=' + channelIds.join('|');
			laterUrl += '&type=' + LIST_TYPE_FAV + '&channels=' + channelIds.join('|');
		};

		favUrl = '?dt=' + getFormattedSliceStartTime(dt) + '&type=fav&channels=7s|6g|7y|8u';

		nowAndNextService.once('getNowAndNext', function(channels, channelEventsCollections){

			var template = req.xhr ? 'nowandnext-ajax.jade' : 'nowandnext.jade'

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				dt 			: dt,
				popUrl      : popUrl,
				favUrl      : favUrl,
				allUrl      : allUrl,
				nowTime     : strftime(dt, '%R'),
				nowDate	    : strftime(dt, '%A %e %B'),
				listType    : listType,
				earlierUrl	: earlierUrl,
				earlierText	: strftime(dtPreviousSlice, '%R'),
				laterUrl	: laterUrl,
				laterText	: strftime(dtNextSlice, '%R'),
				channels	: channels,
				channelEventsCollections: channelEventsCollections,
				supports	: req.supports
			});

		});

		nowAndNextService.getNowAndNext(dt, channelIds);

	};

	/** @return */

	return NowAndNextController;

});