/**
 *	NowAndNextController
 */

define([

	/** @require */

	// services
	'services/nowandnext',
	'services/domain',

	// utils
	'utils/metadata',

	'querystring',
	'config/global.config'

],


/**
 *	@class NowAndNextController
 */

function(NowAndNextService, DomainService, Metadata, QS, config) {

	/** @constructor */

	var NowAndNextController = function(app) {

		_app = app;

		// Routing

		app.server.get('/nowandnext', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// Note that we ignore that MINUTES of the specified time, so that we
	// always ask the EPG api for data starting at the top of each hour.
	var getFormattedSliceStartTime = function(dt) {
		return dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00Z';
	};

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

		// We first need to get details of the "Filter" domain
		(new DomainService()).once('getDomainDetails', function(domainDetails){

			var dt = getDateFromQueryString(req),
				channelIds = [],
				dtPreviousSlice = new Date(dt.valueOf() - (60 * 60 * 1000)),
				dtNextSlice = new Date(dt.valueOf() + (60 * 60 * 1000)),
				currentSliceFormattedStartTime = getFormattedSliceStartTime(dt),
				popUrl = '?dt=' + getFormattedSliceStartTime(dt) + '&type=pop',
				allUrl = '?dt=' + getFormattedSliceStartTime(dt) + '&type=all',
				favUrl,
				earlierUrl = '?dt=' + getFormattedSliceStartTime(dtPreviousSlice),
				laterUrl = '?dt=' + getFormattedSliceStartTime(dtNextSlice),
				strftime = require('prettydate').strftime;

			// Build an array of all the filter options to be offered
			var availableFilterGroups = domainDetails.groups.map(function(group){
				return {text:group.name, url:'/nowandnext/?dt=' + currentSliceFormattedStartTime + '&group=' + group.id}
			});
			// Add an item for "all channels" to the end of the array
			availableFilterGroups.push({text:'All', url:'/nowandnext/?dt=' + currentSliceFormattedStartTime});

			var selectedFilterGroup = req.query['group'];
			if (selectedFilterGroup) {
				domainDetails.groups.forEach(function(group){
					if (group.id===selectedFilterGroup) {
						channelIds = group.channelIds;
					}
				});
				earlierUrl += '&group=' + selectedFilterGroup;
				laterUrl += '&group=' + selectedFilterGroup;
			} else {
				// TODO: use the full channel list here
				channelIds = ['7s','6g','7y','8u'];
			}

			(new NowAndNextService()).once('getNowAndNext', function(channels, channelEventsCollections){

				var template = req.xhr ? 'contents/nowandnext.jade' : 'layouts/nowandnext.jade'

				res.render(template, {
					metadata	: metadata.get(),
					config		: _app.config,
					dt 			: dt,
					availableFilterGroups      : availableFilterGroups,
					nowTime     : strftime(dt, '%R'),
					nowDate	    : strftime(dt, '%A %e %B'),
					earlierUrl	: earlierUrl,
					earlierText	: strftime(dtPreviousSlice, '%R'),
					laterUrl	: laterUrl,
					laterText	: strftime(dtNextSlice, '%R'),
					channels	: channels,
					channelEventsCollections: channelEventsCollections,
					supports	: req.supports
				});

			}).getNowAndNext(dt, channelIds);


		}).getDomainDetails('Filter');

	};

	/** @return */

	return NowAndNextController;

});