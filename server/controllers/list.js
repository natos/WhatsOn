/**
 *	ListController
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
 *	@class ListController
 */

function(NowAndNextService, Metadata, QS, config) {

	/** @constructor */

	var ListController = function(app) {

		_app = app;

		// Routing

		app.server.get('/list', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		nowAndNextService = new NowAndNextService();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// Note that we ignore that MINUTES of the specified time, so that we
	// always ask the EPG api for data starting at the top of each hour.
	var getFormattedSliceStartTime = function(dt) {
		return dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00Z';
	};

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
	}


	/** @public */

	ListController.prototype.render = function(req, res) {

		var dt = getDateFromQueryString(req),
			dtPreviousSlice = new Date(dt.valueOf() - (60 * 60 * 1000)),
			dtNextSlice = new Date(dt.valueOf() + (60 * 60 * 1000)),
			dtStringPreviousSlice = getFormattedSliceStartTime(dtPreviousSlice),
			dtStringNextSlice = getFormattedSliceStartTime(dtNextSlice);

		nowAndNextService.once('getNowAndNext', function(channels, channelEventsCollections){

			res.render('list.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				dt 			: dt,
				dtStringPreviousSlice 			: dtStringPreviousSlice,
				dtStringNextSlice 			: dtStringNextSlice,
				channels	: channels,
				channelEventsCollections: channelEventsCollections,
				supports	: req.supports
			});

		}).getNowAndNext(dt);

	};

	/** @return */

	return ListController;

});