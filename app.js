
/**
 * module dependencies.
 */
var fs = require('fs')
,	util = require('util')
,	querystring = require('querystring')
,	express = require('express')
,	request = require('request')
,	i18n = require('i18n')
,	Timer = require('timetrack')
,	port = process.env.PORT || 3000
,	IdentifiedBrowser = require('./lib/identifiedbrowser.js').IdentifiedBrowser;

/**
 * constants
 */

var API_PREFIX = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/';
//var API_PREFIX = 'http://213.46.250.168/cgi-bin/WebObjects/EPGApi.woa/-2004/api/';

var facebook = {
	'app-id'		: '153316508108487'
,	'app-secret'	: '47a04d4b4c794097717593854b7a4e36'
}

var metadata = [
	{ property: 'og:title'		, content: 'WhatsOn!' }
,	{ property: 'og:type'		, content: 'app' }
,	{ property: 'og:url'		, content: 'http://upcwhatson.herokuapp.com/' }
,	{ property: 'og:image'		, content: 'http://upcwhatson.herokuapp.com/assets/upclogo.jpg' }
,	{ property: 'og:site_name'	, content: 'WhatsOn!' }
,	{ property: 'fb:app_id'		, content: '153316508108487' }
];

var dataCache = {
	allChannels:[]
,	allChannels_timestamp:null
} 

/*
 * JavaScript Pretty Date (http://ejohn.org/files/pretty.js)
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 * Modified by Natan Santolo.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
// now with LOCALIZATION
function prettyDate(time) {

	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || /*day_diff < 0 ||*/ day_diff >= 31 )
		return;

	return day_diff == 0 && (
			diff < 60 && __("just now") ||
			diff < 120 && __("1 minute ago") ||
			diff < 3600 && __("%s minutes ago", Math.floor( diff / 60 ) ) ||
			diff < 7200 && __("1 hour ago") ||
			diff < 86400 && __("%s hours ago", Math.floor( diff / 3600 ) ) ||
			// Added within minutes/hours
			diff > 60 && __("menor a 60") || // ???
			diff > 120 && __("within 1 min") ||
			diff > 3600 && __("within %s minutes", Math.floor( diff / 60 ) ) ||
			diff > 7200 && __("within 1 hour") ||
			diff > 86400 && __("within %s hours", Math.floor( diff / 3600 ) ) ) ||
		day_diff == 1 && __("yesterday") ||
		// Added tomorrow
		day_diff == -1 && __("tomorrow") ||
		// Added within days
		day_diff < 7 && ( (day_diff < -1) ? __("within %s days", (day_diff*-1) ) : __("%s days ago", day_diff ) ) ||
//		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && __("%s weeks ago", Math.ceil( day_diff / 7 ) )
}

/**
 * @require prettyDate()
 * @param collection Array
 * @param [property] String 'startDateTime'
 * @return events Array
 */

var prettifyDates = function(collection, property) {
	var events = [], i = 0, t = collection.length, property = property || 'startDateTime';
	for (i; i < t; i++) {
		event = collection[i];
		collection[i].prettyDate = prettyDate( collection[i][property] );
		events.push( collection[i] );
	}
	return events;
}

var getWeekFromToday = function() {

	var week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
	,	thisWeek = []
	,	today = new Date().getDay();

	// Get the days after today
	for (var i = today; i < week.length; i++) {
		thisWeek.push( week[i] );
	}

	// Get the days before today
	for (var i = 0; i < today; i++) {
		thisWeek.push( week[i] );
	}

	return thisWeek;
}

/**
 * Multiple Requests
 */

/**
 * Handle multiple requests at once
 * @param urls [array]
 * @param callback [function]
 * @requires request module for node ( https://github.com/mikeal/request )
 */
var __request = function (urls, callback) {

	'use strict';

	var results = {}, t = urls.length, c = 0,
		handler = function (error, response, body) {

			var url = response && response.request.uri.href;

			results[url] = { error: error, response: response, body: body };

			if (++c === urls.length) { callback(results); }

		};

	while (t--) { request(urls[t], handler); }
};

/**
 * i18n
 */

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'es', 'nl'],

    // where to register __() and __n() to, might be "global" if you know what you are doing
    register: global
});

/**
 * app configuration.
 */
var app = express.createServer();


app.configure(function(){

	app.use(express.bodyParser());
	app.use(express.methodOverride());
    app.use(i18n.init);
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

	app.set('views', __dirname + '/views');

	// disable layout
	app.set("view options", { layout: false });

	// make a custom html template
	app.register('.html', {
		compile: function(str, options) {
		return function(locals) {
			return str;
		};
	}
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// i18n helpers
// register helpers for use in templates
app.helpers({
  __i: i18n.__,
  __n: i18n.__n
});


/**
 * Routing.
 */

app.get('*', function(req, res, next){

	/**
	 * Support.
	 */

	req.support = {
		FixedPosition: new IdentifiedBrowser(req).supports.CSSFixedPosition()
	,	sarcasm: false
	}

	// Force locale
	i18n.setLocale('nl');
//	i18n.setLocale('es');

	next();
})

// index
app.get('/', function(req, res) {

	var topbookings, channels;

	var TOPBOOKINGS = 'http://' + req.headers.host + '/topbookings.json'
	,	ALLCHANNELS = 'http://' + req.headers.host + '/channels.json';

	__request(

		[TOPBOOKINGS, ALLCHANNELS],

		function(response) {

			// API Error?
			var error;
			for ( API in response ) {
				if ( response[API].response.statusCode === 500 ) {
					error = response[API].body + ' requesting: ' + API;
					console.log(error);
					res.send(error);
					return;
				}
			}

			var _topbookings = JSON.parse( response[TOPBOOKINGS].body )
			,	_allchannels = JSON.parse( response[ALLCHANNELS].body );

			res.render('home.jade', {
				title		: "Whats On TV"
			,	metadata	: metadata
			,	topbookings : _topbookings
			,	channels 	: _allchannels 
			,	prefix		: ''
			,	supportsCSSFixedPosition: req.support.FixedPosition
			,	API_PREFIX	: API_PREFIX
			}); // HTML output

		}
	)
});


app.get('/grid', function(req, res) {

	var gridTimer = new Timer('Grid View');

	var ALL_CHANNELS = API_PREFIX + 'Channel.json?order=position';

	request(ALL_CHANNELS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + ALL_CHANNELS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			gridTimer.track('All channels API Response');

			body = JSON.parse(body);

			res.render('grid.jade', { 
				data		: body
			,	title		: "Grid"
			,	metadata	: metadata
			,	prefix		: ''
			,	week		: getWeekFromToday()
			,	supportsCSSFixedPosition: req.support.FixedPosition
			,	API_PREFIX	: API_PREFIX
			}); // HTML output
			
		}
	});
});


app.get('/topbookings.:format?', function(req, res) {

	var topBookingsTimer = new Timer('TopBookings View');

    var format = req.params.format // html, json, etc
	,	events = [];

//	var TOP_BOOKINGS = 'http://tvgids.upc.nl/customerApi/wa/topBookings';
	var TOP_BOOKINGS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGBooking.woa/wa/topBookings';

	request(TOP_BOOKINGS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + TOP_BOOKINGS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			topBookingsTimer.track('API Response');

			// Grab the data from the mockup
			if (!body) {
				body = JSON.parse(fs.readFileSync(__dirname + "/mocks/topbookings.json"));
			} else {
				body = JSON.parse(body);
			}
		
			var event, i = 0, t = body.length;
			for (i; i < t; i++) {
				event = body[i][0];
				// Prettyfy date format: 
				// instead of '2012-02-14T17:14:45.341Z' value show something like 'Tomorrow'
				event.prettyDate = prettyDate(event.startDateTime)
				events.push( event );
			}

			// determine the output rendering
			switch (format) {

				case "json":
					res.send(events); // JSON output
					break;

				default:
				case "html": 
					res.render('topbookings.jade', { 
						data		: events
					,	title		: "Top Bookings"
					,	metadata	: metadata 
					,	prefix		: ''
					,	supportsCSSFixedPosition: req.support.FixedPosition
					,	API_PREFIX	: API_PREFIX
					}); // HTML output
			}
			
		}

	});

});

// channel
app.get('/channels.:format?', function(req, res) {
	'use strict';

	var allChannelsTimer = new Timer('All Channels View');

    var id = req.params.id
	,	format = req.params.format // html, json, etc

//	var ALL_CHANNELS = API_PREFIX + 'Channel.json?order=position';

	var ALL_CHANNELS_0 = API_PREFIX + 'Channel.json?order=position&batch=0'
	,	ALL_CHANNELS_1 = API_PREFIX + 'Channel.json?order=position&batch=1'
	,	ALL_CHANNELS_2 = API_PREFIX + 'Channel.json?order=position&batch=2';

	var renderChannels = function(allChannels) {
		// determine the output rendering
		switch (format) {

			case "json":
				res.send(allChannels); // JSON output
				break;

			default:
			case "html": 
				res.render('channels.jade', { 
					data		: allChannels
				,	title		: "All Channels"
				,	metadata	: metadata 
				,	prefix		: ''
				,	supportsCSSFixedPosition: req.support.FixedPosition
				,	API_PREFIX	: API_PREFIX
				}); // HTML output
		}
	}

	// Render channels from cache, if available
	var allChannels = dataCache['allChannels'];
	var allChannels_timestamp = dataCache['allChannels_timestamp'];
	var now = new Date();
	var cacheDurationMilliseconds = 60 * 60 * 1000; // cache for 1 hour

	if (allChannels && allChannels.length > 0 && allChannels_timestamp && typeof(allChannels_timestamp.valueOf)==='function' && (now.valueOf() - allChannels_timestamp.valueOf() < cacheDurationMilliseconds)) {
		// from cache
		renderChannels(allChannels);
	} else {
		// from api
		var requestUrls = [ALL_CHANNELS_0, ALL_CHANNELS_1, ALL_CHANNELS_2];

		__request(

			requestUrls,

			function (responses) {

				allChannelsTimer.track('All API Responses received')
				allChannels = [];
				var errorsCount = 0;
				var channelsBatch;

				for (var i=0; i<3; i++) {
					if (!responses[requestUrls[i]] || responses[requestUrls[i]].error) {
						console.log("Error requesting " + requestUrls[i] + ": " + responses[requestUrls[i]].error);
						errorsCount++;
					}
				}

				if (errorsCount===0) {
					for (var i=0; i<3; i++) {
						if (!responses[requestUrls[i]].error && responses[requestUrls[i]].response.statusCode == 200) {
							channelsBatch = JSON.parse(responses[requestUrls[i]].body);
							allChannels = allChannels.concat(channelsBatch);
						}
					}
					dataCache['allChannels'] = allChannels;
					dataCache['allChannels_timestamp'] = new Date();
				}

				renderChannels(allChannels);
			}
		);
	}

});


// channel
app.get('/channel/:id.:format?', function(req, res) {

	var channelTimer = new Timer('Channel View');

    var id = req.params.id
	,	format = req.params.format // html, json, etc
	;

	var CHANNEL_DETAILS = API_PREFIX + 'Channel/' + id + '.json',
		CHANNEL_EVENTS = API_PREFIX + 'Channel/' + id + '/events/NowAndNext.json?order=startDateTime'

	__request(

		[CHANNEL_DETAILS, CHANNEL_EVENTS],

		function(response) {

			channelTimer.track('API Response');

			// API Error?
			var error;
			for ( API in response ) {
				if ( response[API].response.statusCode === 500 ) {
					error = response[API].body + ' requesting: ' + API;
					console.log(error);
					res.send(error);
					return;
				}
			}

			var _channel_details = JSON.parse( response[CHANNEL_DETAILS].body )
			,	_channel_events = JSON.parse( response[CHANNEL_EVENTS].body );

			_channel_details.events = prettifyDates( _channel_events );	

			// Meta data
			var _metadata = [
				{ property: "fb:app_id"			, content: "153316508108487" }
			,	{ property: "og:type"			, content: "upc-whatson:tv_channel" }
			,	{ property: "og:url"			, content: "http://upcwhatson.herokuapp.com/channel/" + _channel_details.id + ".html" }
			,	{ property: "og:title"			, content: _channel_details.name }
			,	{ property: "og:description"	, content: _channel_details.description }
			,	{ property: "og:image"			, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
			];

			// determine the output rendering
			switch (format) {

				case "json":
					res.send(_channel_details); // JSON output
					break;

				default:
				case "html": 
					res.render('channel.jade', { 
						data		: _channel_details
					,	title		: _channel_details.name
					,	metadata	: _metadata
					,	prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upc-whatson: http://ogp.me/ns/fb/upc-whatson#' 
					,	supportsCSSFixedPosition: req.support.FixedPosition
					,	API_PREFIX	: API_PREFIX
					}); // HTML output	
			}
		}
	);
});


// programme
app.get('/programme/:id.:format?', function(req, res) {

	var programmeTimer = new Timer('Programme View');

    var id = req.params.id
	,	format = req.params.format // html, json, etc
	,	events = []
	,	isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest'
	,	now = new Date();


	var PROGRAMME_DETAILS = API_PREFIX + 'Programme/' + id + '.json'
	,	PROGRAMME_EVENTS = API_PREFIX + 'Programme/' + id + '/events.json?order=startDateTime'


	__request(

		[PROGRAMME_DETAILS, PROGRAMME_EVENTS], 

		function(response) {

			programmeTimer.track('API Response');

			// API Error?
			var error;
			for ( API in response ) {
				if ( response[API].response.statusCode === 500 ) {
					error = response[API].body + ' requesting: ' + API;
					console.log(error);
					res.send(error);
					return;
				}
			}

			var _programme_details = JSON.parse( response[PROGRAMME_DETAILS].body )
			,	_programme_events = JSON.parse( response[PROGRAMME_EVENTS].body );

			// add the events collection to the response body
			_programme_details.events = _programme_events;

			// Is a film, I need to change the og:type 
			var isMovie = (_programme_details.subcategory.category.name.toLowerCase() == 'speelfilm');

			// Meta data
			var _metadata = [
				{ property: "fb:app_id"			, content: "153316508108487" }
			,	{ property: "og:type"			, content: (isMovie) ? "video.movie" : "video.tv_show" }
			,	{ property: "og:url"			, content: "http://upcwhatson.herokuapp.com/programme/" + _programme_details.id + ".html" }
			,	{ property: "og:title"			, content: _programme_details.title }
			,	{ property: "og:description"	, content: _programme_details.shortDescription } 
			,	{ property: "og:image"			, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
			];

			// determine the output rendering
			switch (format) {
	
				case "json":
					res.send(_programme_details); // JSON output
					break;

				default:
				case "html": 
					res.render('programme.jade', { 
						data		: _programme_details
					,	title		: _programme_details.title
					,	metadata	: _metadata
					,	prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# video: http://ogp.me/ns/video#'
					,	isAjax		: isAjax
					,	supportsCSSFixedPosition: req.support.FixedPosition
					,	API_PREFIX	: API_PREFIX
					}); // HTML output
			}
		}
	);
});

// programme
app.get('/search', function(req, res) {

	// TODO:	Handle Empty responses 
	//			"Not found"

	var searchTimer = new Timer('Search Timer');

	var query = querystring.escape(req.query.q) || ''
	,	isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest'
	,	events = []
	,	now = new Date();

	// grab data from the mock
	var results = JSON.parse(fs.readFileSync(__dirname + "/mocks/search.json"));

	var event, i = 0, t = results.length;
	for (i; i < t; i++) {
		event = results[i][0];
		event.prettyDate = prettyDate(event.startDateTime)
		events.push( event );
	}

	var QUERY_URL = API_PREFIX + 'Event.json?query=' + query 
		//	Non of these optional parameters works on search API
		//+ '&amp;optionalProperties=Event.subcategory,Event.category'
		//+ '&amp;order=startDateTime'
	,	ALL_CHANNELS = 'http://' + req.headers.host + '/channels.json'
	,	CATEGORIES = API_PREFIX + 'Category.json'
	,	SUBCATEGORIES = API_PREFIX + 'Subcategory.json'

	__request( // Multiple requests

		[QUERY_URL, ALL_CHANNELS, CATEGORIES, SUBCATEGORIES],

		function(results) {

			searchTimer.track('API Response');

			// API Error?
			var error;
			for ( API in response ) {
				if ( response[API].response.statusCode === 500 ) {
					error = response[API].body + ' requesting: ' + API;
					console.log(error);
					res.send(error);
					return;
				}
			}

			var _results = JSON.parse( results[QUERY_URL].body )
			,	_all_channels = JSON.parse( results[ALL_CHANNELS].body )
			,	_categories = JSON.parse( results[CATEGORIES].body )
			,	_subcategories = JSON.parse( results[SUBCATEGORIES].body )


			// Mixing categorie tree
			var categoriesTree = [];
			var category, i = 0, c = _categories.length, s = _subcategories.length;
			for (i; i < t; i++) {
				category = _categories[i];
				category.subs = [];
				var e = 0;
				for (e; e < s; e++) {
					if (_subcategories[e].category.name === category.name) {
						category.subs.push(_subcategories[e])
					}
				}
				categoriesTree.push(category);
			}


			// Prettyfing dates
			_results = prettifyDates(_results);
			
			// Sorting results
			_results.sort(function sortResults(a, b) {
				return new Date(a.startDateTime).valueOf() - new Date(b.startDateTime).valueOf();
			});

			// Get used channels and times, you know, maps.
			// this will be help the filters later
			var _used_channels = {},
				_used_datetimes = {},
				_t = _results.length;

			while(_t--) {
				_used_channels[_results[_t].channel.id] = _results[_t].channel;
				_used_datetimes[_results[_t].prettyDate] = _results[_t].startDateTime;
			}

			searchTimer.track('End processing');
			console.log(_used_channels);

			res.render('search.jade', { 
				query		: querystring.unescape(query) // querystring
			,	title		: 'Search'
			,	metadata	: metadata
			,	prefix		: ''
			,	results		: _results //events
			,	isAjax		: isAjax
			,	channels	: _all_channels
			,	categories 	: categoriesTree
			,	supportsCSSFixedPosition: req.support.FixedPosition
			// filtering options
			,	used_channels: _used_channels
			,	used_datetimes: _used_datetimes
			,	API_PREFIX	: API_PREFIX
			}); // HTML output

		}
	);

});


// Get IMDB poster based on title
app.get('/imdbPoster/:title', function(req, res) {

	var posterTimer = new Timer('Poster Timer');

    var title = req.params.title,
		imdbApiQuery = 'http://www.imdbapi.com/?t=' + escape(title);

	request(imdbApiQuery, function(error, response, body){
		if(!error && response.statusCode == 200){

			posterTimer.track('Poster Response Success');

			var imdbInfo = JSON.parse(body);
			res.send('<img src="' + imdbInfo.Poster + '" />');
		} else {

			posterTimer.track('Poster Response Error');

			res.send('');
		}
	})
});

/**
 * app start
 */
app.listen(port);

/**
 * log
 */
console.log("Express server listening on port %d", app.address().port);