
/**
 * module dependencies.
 */
var fs = require('fs')
,	util   = require('util')
,	express = require('express')
,	request = require('request')
,	i18n = require('i18n')
,	port = process.env.PORT || 3000
,	IdentifiedBrowser = require('./lib/identifiedbrowser.js').IdentifiedBrowser
,	Timer = require('./public/js/libs/timer/timer.js').Timer;

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

/*
 * JavaScript Pretty Date (http://ejohn.org/files/pretty.js)
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 * Modified by Natan Santolo.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function _prettyDate(time){
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || /*day_diff < 0 ||*/ day_diff >= 31 )
		return;

	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago" ||
			// Added within minutes/hours
			diff > 60 && "menor a 60" || // ???
			diff > 120 && "within 1 min" ||
			diff > 3600 && "within " + Math.floor( diff / 60 ) + " minutes" ||
			diff > 7200 && "within 1 hour" ||
			diff > 86400 && "within " + Math.floor( diff / 3600 ) + " hours") ||
		day_diff == 1 && "yesterday" ||
		// Added tomorrow
		day_diff == -1 && "tomorrow" ||
		// Added within days
		day_diff < 7 && ( (day_diff < -1) ? "within " + (day_diff*-1) + " days" : day_diff + " days ago" ) ||
//		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago"
}

// LOCALE
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
	// Force locale
	i18n.setLocale('nl');

	next();
})

// index
app.get('/', function(req, res) {

	var topbookings, channels;

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

	request('http://' + req.headers.host + '/topbookings.json', function(error, response, body) {

		topbookings = JSON.parse(body);

		console.log('Top Bookings here');

	}); // end request

	request('http://' + req.headers.host + '/channels.json', function(error, response, body) {

		console.log('All channels here');

		channels = JSON.parse(body);

	}); // end request

	var i = 0;

	// Wait for both of the responses before render
	var render = function() {

		console.log('Waiting for APIs… ' + i++ + 'seg');

		if (topbookings && channels) {

			res.render('home.jade', {
				title		: "Whats On TV"
			,	metadata	: metadata
			,	topbookings : topbookings
			,	channels : channels 
			,	prefix		: ''
			,	supportsCSSFixedPosition: supportsCSSFixedPosition
			}); // HTML output

		} else {
			setTimeout(render, 1000);
		}
	}

	render();

});

app.get('/topbookings.:format?', function(req, res) {

	var topBookingsTimer = new Timer('TopBookings View');

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

    var format = req.params.format // html, json, etc
	,	events = [];

//	var TOP_BOOKINGS = 'http://tvgids.upc.nl/customerApi/wa/topBookings';
	var TOP_BOOKINGS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGBooking.woa/wa/topBookings';

	request(TOP_BOOKINGS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + TOP_BOOKINGS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			topBookingsTimer.track('Top Bookings API Response');

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
					,	supportsCSSFixedPosition: supportsCSSFixedPosition
					}); // HTML output
			}
			
		}

	});

});

app.get('/grid', function(req, res) {

	var gridTimer = new Timer('Grid View');

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

	var ALL_CHANNELS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel.json?order=position';

	request(ALL_CHANNELS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + ALL_CHANNELS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			gridTimer.track('All channels API Response');

			body = JSON.parse(body);
//			body = JSON.stringify(body);

			res.render('grid.jade', { 
				data		: body
			,	title		: "Grid"
			,	metadata	: metadata
			,	prefix		: ''
			,	timeFrame   : new Array(72) // 148 hrs
			,	week		: getWeekFromToday()
			,	supportsCSSFixedPosition: supportsCSSFixedPosition
			}); // HTML output
			
		}
	});
});

// channel
app.get('/channels.:format?', function(req, res) {

	var allChannelsTimer = new Timer('All Channels View');

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

    var id = req.params.id
	,	format = req.params.format // html, json, etc

	var ALL_CHANNELS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel.json?order=position';

	request(ALL_CHANNELS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + ALL_CHANNELS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			allChannelsTimer.track('All Channels API Response')

			body = JSON.parse(body);

			// determine the output rendering
			switch (format) {

				case "json":
					res.send(body); // JSON output
					break;

				default:
				case "html": 
					res.render('channels.jade', { 
						data		: body
					,	title		: "All Channels"
					,	metadata	: metadata 
					,	prefix		: ''
					,	supportsCSSFixedPosition: supportsCSSFixedPosition
					}); // HTML output
			
			}
		}

	});

});


// channel
app.get('/channel/:id.:format?', function(req, res) {

	var channelTimer = new Timer('Channel View');

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

    var id = req.params.id
	,	format = req.params.format // html, json, etc
	,	events = []
	,	now = new Date();

	var CHANNEL_DETAILS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + id + '.json',
		CHANNEL_EVENTS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + id + '/events/NowAndNext.json?order=startDateTime'

	request(CHANNEL_DETAILS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + CHANNEL_DETAILS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			channelTimer.track('Channel Detail API Response');

			request(CHANNEL_EVENTS, function (ierror, iresponse, ibody) {

				if (ierror) {
					console.log("Error requesting " + CHANNEL_EVENTS + ": " + ierror);
				}

				if (!ierror && iresponse.statusCode == 200) {

					channelTimer.track('Channel Events API Response');

					body = JSON.parse(body);
					ibody = JSON.parse(ibody);

					ibody.sort();

					var event, i = 0, t = ibody.length;
					for (i; i < t; i++) {
						event = ibody[i];
						// Avoid to show events from the past and add a prettyfy date format: 
						// instead of '2012-02-14T17:14:45.341Z' value show something like 'Tomorrow'
						if ( new Date(event.startDateTime) > now ) {
							event.prettyDate = prettyDate(event.startDateTime)
							events.push( event );
						}
					}
					// add the events collection to the response body
					body.events = events;

					// Meta data
					var _metadata = [
					  { property: "fb:app_id"		, content: "153316508108487" }
					, { property: "og:type"			, content: "upc-whatson:tv_channel" }
					, { property: "og:url"			, content: "http://upcwhatson.herokuapp.com/channel/" + body.id + ".html" }
					, { property: "og:title"		, content: body.name }
					, { property: "og:description"	, content: body.description } // not working
					, { property: "og:image"		, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
					];

					// determine the output rendering
					switch (format) {

						case "json":
							res.send(body); // JSON output
							break;

						default:
						case "html": 
							res.render('channel.jade', { 
								data		: body
							,	title		: body.name
							,	metadata	: _metadata
							,	prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upc-whatson: http://ogp.me/ns/fb/upc-whatson#' 
							,	supportsCSSFixedPosition: supportsCSSFixedPosition
							}); // HTML output
				
					}

				}

			});

		}

	});

});


// programme
app.get('/programme/:id.:format?', function(req, res) {

	var programmeTimer = new Timer('Programme View');

	var supportsCSSFixedPosition = new IdentifiedBrowser(req).supports.CSSFixedPosition();

    var id = req.params.id
	,	format = req.params.format // html, json, etc
	,	events = []
	,	isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest'
	,	now = new Date();


	var PROGRAMME_DETAILS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Programme/' + id + '.json'
	,	PROGRAMME_EVENTS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Programme/' + id + '/events.json?order=startDateTime'

	request(PROGRAMME_DETAILS, function (error, response, body) {

		if (error) {
			console.log("Error requesting " + PROGRAMME_DETAILS + ": " + error);
		}

		if (!error && response.statusCode == 200) {

			programmeTimer.track('Programme Details API Response');

			request(PROGRAMME_EVENTS, function (ierror, iresponse, ibody) {

				if (ierror) {
					console.log("Error requesting " + PROGRAMME_EVENTS + ": " + ierror);
				}

				if (!ierror && iresponse.statusCode == 200) {

					programmeTimer.track('Programme Events API Response');

					body = JSON.parse(body);
					ibody = JSON.parse(ibody);

					var event, i = 0, t = ibody.length;
					for (i; i < t; i++) {
						event = ibody[i];
						// Avoid to show events from the past and add a prettyfy date format: 
						// instead of '2012-02-14T17:14:45.341Z' value show something like 'Tomorrow'
						if ( new Date(event.startDateTime) > now ) {
							event.prettyDate = prettyDate(event.startDateTime)
							events.push( event );
						}
					}

					// add the events collection to the response body
					body.events = events;

					if (body.subcategory.category.name.toLowerCase() == 'speelfilm') {

						// Is a film, I need to change the og:type 

					}

					// Meta data
					var _metadata = [
					  { property: "fb:app_id"		, content: "153316508108487" }
					, { property: "og:type"			, content: "video.tv_show" }
					, { property: "og:url"			, content: "http://upcwhatson.herokuapp.com/programme/" + body.id + ".html" }
					, { property: "og:title"		, content: body.title }
					, { property: "og:description"	, content: body.shortDescription } 
					, { property: "og:image"		, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
					];

					// determine the output rendering
					switch (format) {
	
						case "json":
							res.send(body); // JSON output
							break;

						default:
						case "html": 
							res.render('programme.jade', { 
								data		: body
							,	title		: body.title
							,	metadata	: _metadata
							,	prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# video: http://ogp.me/ns/video#'
							,	isAjax		: isAjax
							}); // HTML output
			
					}
				}

			}); // End Request PROGRAMME_EVENTS

		}

	}); // End Request PROGRAMME_DETAILS

});

// programme
app.get('/search', function(req, res) {

	var query = req.query.q || ''
	,	isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

	res.render('search.jade', { 
		query		: query
	,	title		: 'Search'
	,	metadata	: metadata
	,	prefix		: ''
	,	isAjax		: isAjax
	}); // HTML output

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