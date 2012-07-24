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
		app.server.get('/nowandnext/dt/:dt', this.render);
		app.server.get('/nowandnext/group/:groupid', this.render);
		app.server.get('/nowandnext/group/:groupid/dt/:dt', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// Note that we ignore that MINUTES of the specified time, so that we
	// always ask the EPG api for data starting at the top of each hour.
	var getFormattedSliceStartTime = function(dt) {
		var str = dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00Z';
		return str;
	};

	// TODO: Use Date.parse() for simpler way of parsing date in query string?
	// (Check timezone handling.)
	var getStartDate = function(req) {
		var dt,
			nowDt = new Date(),
			dtString = req.params.dt,
			parts,
			dateParts,
			timeParts;

		nowDt.setMinutes(0);
		nowDt.setSeconds(0);

		if (dtString) {
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
				dt = nowDt;
			}
		} else {
			dt = nowDt;
		}

		return dt;
	};


	/** @public */

	NowAndNextController.prototype.render = function(req, res) {

		// We first need to get details of the "Filter" domain
		(new DomainService()).once('getDomainDetails', function(domainDetails){

			var dt = getStartDate(req),
				channelIds = [],
				dtPreviousSlice = new Date(dt.valueOf() - (60 * 60 * 1000)),
				dtNextSlice = new Date(dt.valueOf() + (60 * 60 * 1000)),
				currentSliceFormattedStartTime = getFormattedSliceStartTime(dt),
				earlierUrl = '/nowandnext/dt/' + getFormattedSliceStartTime(dtPreviousSlice),
				laterUrl = '/nowandnext/dt/' + getFormattedSliceStartTime(dtNextSlice),
				strftime = require('prettydate').strftime;

			// Build an array of all the filter options to be offered
			var availableFilterGroups = domainDetails.groups.map(function(group){
				return {
					id:  group.id,
					text: group.name,
					url: '/nowandnext/group/' + group.id + '/dt/' + currentSliceFormattedStartTime,
					channelIds: group.channelIds
				};
			});
			// Add an item for "all channels" to the end of the array
			availableFilterGroups.push({
				id: 'all',
				text: 'Alle zenders',
				url: '/nowandnext/group/all/dt/' + currentSliceFormattedStartTime,
				channelIds: _app.channels.map(function(channel){return channel.id;})
			});

			var selectedFilterGroupId = req.params.groupid;
			// If no filter group specified in the URL, use the first group in the list
			if (!selectedFilterGroupId) {
				selectedFilterGroupId = availableFilterGroups[0].id;
			}

			availableFilterGroups.forEach(function(group){
				if (group.id===selectedFilterGroupId) {
					channelIds = group.channelIds;
					earlierUrl = '/nowandnext/group/' + group.id + '/dt/' + getFormattedSliceStartTime(dtPreviousSlice);
					laterUrl = '/nowandnext/group/' + group.id + '/dt/' + getFormattedSliceStartTime(dtNextSlice);
					group.selected = true;
				}
			});

			(new NowAndNextService()).once('getNowAndNext', function(channels, channelEventsCollections){

				var template = req.xhr ? 'contents/nowandnext.jade' : 'layouts/nowandnext.jade';

				res.render(template, {
					metadata	: metadata.get(),
					config		: _app.config,
					dt 			: dt,
					availableFilterGroups      : availableFilterGroups,
					nowTime     : strftime(dt, '%R'),
					nowDate	    : strftime(dt, '%a %e %B'),
					earlierUrl	: earlierUrl,
					earlierText	: strftime(dtPreviousSlice, '%R'),
					laterUrl	: laterUrl,
					laterText	: strftime(dtNextSlice, '%R'),
					channels	: channels,
					channelEventsCollections: channelEventsCollections,
					supports	: req.supports,
					xhr			: req.xhr
				});

			}).getNowAndNext(dt, channelIds, false);


		}).getDomainDetails('Filter');

	};

	/** @return */

	return NowAndNextController;

});