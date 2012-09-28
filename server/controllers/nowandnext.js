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

		app.server.get('/nowandnext', this.renderEmpty);

		// app.server.get('/nowandnext', this.render);
		// app.server.get('/nowandnext/dt/:dt', this.render);
		// app.server.get('/nowandnext/group/:groupid', this.render);
		// app.server.get('/nowandnext/group/:groupid/dt/:dt', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	var getFormattedSliceStartTime = function(dt) {
		var str = dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':' + ('00' + dt.getUTCMinutes().toString()).slice(-2) + 'Z';
		return str;
	};


	/** @public */

	NowAndNextController.prototype.renderEmpty = function(req, res) {
		var template = req.xhr ? 'contents/empty-content.jade' : 'layouts/empty-layout.jade';

		res.render(template, {
			metadata	: metadata.get(),
			config		: _app.config,
			supports	: req.supports,
			xhr			: req.xhr
		});
	}

	NowAndNextController.prototype.render = function(req, res) {
		
		// *** 6/10/2012 NS: Do we really need to pull this service on every request?

		// We first need to get details of the "Filter" domain
		(new DomainService()).once('getDomainDetails', function(domainDetails){

			var dt = new Date(),
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

			}).getNowAndNext(dt, channelIds, true);


		}).getDomainDetails('Filter');

	};

	/** @return */

	return NowAndNextController;

});