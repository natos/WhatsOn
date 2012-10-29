/* 
* ScheduleModule
* --------------
* Pre-fetchs all the necesary data
* to run the App.
*/

define([

	'config/app',
	'config/channel',
	'models/app',
	'models/channel',
	'modules/event',
	'modules/router',
	'utils/epgapi',
	'utils/common',
	'lib/cookie/cookie'

], function ScheduleModuleScope(a, c, AppModel, ChannelModel, Event, Router, EpgApi, common, cookie) {

	var name = 'schedule',

/* private */
		
		cache = {},

		is_ready = false,

		// hardcode value for country
		COUNTRY = cookie.get(a.SELECTED_COUNTRY) || a.DEFAULT_COUNTRY;

	/* Handle data comming from the API */

	Event.on(a.COUTRIES_RECEIVED, function(response) { 

		processResponse(response, a.COUNTRIES_CACHE);

		// Check if theres a cookie
		// with country selection
		if (COUNTRY) {
			AppModel.set(a.SELECTED_COUNTRY, COUNTRY);
		} else {
			console.log('no country?')
		}

		console.log('Selecting', COUNTRY ,'country');

	});

	Event.on(a.CATEGORIES_RECEIVED, function(response) {

		processResponse(response, a.CATEGORIES_CACHE);

	});

	Event.on(a.GENRES_RECEIVED, function(response) {

		processResponse(response, a.GENRES_CACHE);

	});

	Event.on(a.LINEUP_RECEIVED, function(response) {

		processResponse(response, a.LINEUP_CACHE);

	});

	Event.on(a.SCHEDULES_RECEIVED, function(response) {

		processResponse(response, a.SCHEDULES_CACHE);

	});

	/* Handle data procceced */

	Event.on(a.MODEL_CHANGED, function(changes) {

		// Once we got countries information
		if (changes[a.COUNTRIES_CACHE]) {
			
			// a selection of country means
			// we need to re-fetch data
		}

		if (changes[a.SELECTED_COUNTRY]) {

			// Reset model data
			AppModel[a.LINEUP_CACHE] = cache[a.LINEUP_CACHE] = null;
			AppModel[a.SCHEDULES_CACHE] = cache[a.SCHEDULES_CACHE] = null;
			AppModel[a.CATEGORIES_CACHE] = cache[a.CATEGORIES_CACHE] = null;
			AppModel[a.GENRES_CACHE] = cache[a.GENRES_CACHE] = null;

			// get schedule data
			getSchedules();
			// get channel Lineup
			getLineup();
		}

		if (changes[a.SCHEDULES_CACHE]) {
			// get categorires and genres
			getCategoriesAndGenres();
		}

		if (changes[a.LINEUP_CACHE]) {
			processLineup(changes[a.LINEUP_CACHE]);
		}

		ready(); //?
	});

	function ready() {
		if (!is_ready) {
			if (ChannelModel[c.SELECTED_GROUP] && AppModel[a.CATEGORIES_CACHE] && AppModel[a.GENRES_CACHE]) {
				is_ready = !is_ready;
				Event.emit(a.READY);
			}
		}
	}

	/* Processing functions */

	function processResponse(response, label) {

		if (!cache[label]) {

			cache[label] = response;

		} else {

			for (var i = 0, t = response.data.length; i < t; i++) {
				cache[label].data.push(response.data[i]);
			}
		}

		if (!response.nextBatchLink) {

			cache[label].nextBatchLink = null;
			delete cache[label].nextBatchLink;

			console.log('<SCHEDULE>', 'Saving', label, 'on Model.');

			AppModel.set(label, cache[label]);

		}
	}

	function getLineup() {

		var country, request;

		for (var i = 0, t = cache[a.COUNTRIES_CACHE].data.length; i < t; i++) {
			
			country = cache[a.COUNTRIES_CACHE].data[i];
			
			// Here is where the app decides 
			// wich country schedule to use
			if (country.name === AppModel[a.SELECTED_COUNTRY]) {

				request = country.linearLineupLink.href.split('?')[0];

				// get Nederland services lineup
				EpgApi.getLineUpFromAPI(request);

				// stop iteration
				break;

			}
		}
	}

	function getSchedules() {

		var country, request;

		for (var i = 0, t = cache[a.COUNTRIES_CACHE].data.length; i < t; i++) {
			
			country = cache[a.COUNTRIES_CACHE].data[i];

			// Here is where the app decides 
			// wich country schedule to use
			if (country.name === AppModel[a.SELECTED_COUNTRY]) {

				request = country.schedules.data[0].selfLink.href.split('?')[0];

				EpgApi.getSchedulesFromAPI(request);
			}
		}
	}

	function getCategoriesAndGenres() {

		var schedule, request;

		schedule = cache[a.SCHEDULES_CACHE].data[0];

		if (schedule.categories) {
			// save the first slice of categories,
			cache[a.CATEGORIES_CACHE] = schedule.categories;
			// and ask for the nextBatch if its available.
			if (schedule.categories.nextBatchLink) {
				// let the EpgApi deals with async
				EpgApi.query(schedule.categories.nextBatchLink.href, a.CATEGORIES_RECEIVED);

			}
		}

		if (schedule.genres) {
			// save the first slice of genres,
			cache[a.GENRES_CACHE] = schedule.genres;
			// and ask for the nextBatch if its available.
			if (schedule.genres.nextBatchLink) {
				// let the EpgApi deals with async
				EpgApi.query(schedule.genres.nextBatchLink.href, a.GENRES_RECEIVED);

			}
		}
	}

	/**
	* Process the channel collection, creates a 'groups' collection order by group id
	* to lighting-fast query channels information.
	*/

	function processLineup(lineup) {

		var data = lineup.data, groups = {}, byId = {}, group, channel, domain, i, domainIterator, groupIterator, dataLength = data.length;
			// All Zenders collection
			groups['000'] = [];
			// Favorite channels collection
			groups['001'] = [];

		for (i = 0; i < dataLength; i++) {
			channel = data[i];
			// save channel by id
			byId[channel.id] = channel;
			// logo easy access THANK YOU!
			byId[channel.id].logo = channel.logoLink.href;
			// save channels on All Zenders collection
			groups['000'].push(channel);
			// a little cleanning
			delete channel.logoLink;
			delete channel.logicalPosition;
			delete channel.channel;
			
			/*
			// iterate domains
			domainIterator = channel.domains.length;
			while(domainIterator--) {
				domain = channel.domains[domainIterator];
				// domain cleanning
				groupIterator = domain.groups.length;
				while(groupIterator--) {
					group = domain.groups[groupIterator];
					if (!groups[group]) { groups[group] = []; }
					groups[group].push(channel);
				}
			}*/
		}

		// TODO: sort channels 

		// Save byId map
		ChannelModel.set(c.BY_ID, byId);
		// Save groups map
		ChannelModel.set(c.GROUPS, groups);
		// Set default selected group
		// ATTENTION: Read user preferences here
		ChannelModel.set(c.SELECTED_GROUP, c.DEFAULT_GROUP);

		ready(); //?

		// return raw data
		return data;
	}

/* public */

	function initialize() {

		// Get Countries information
		EpgApi.getCountriesFromAPI();

	}

	function finalize() {

		// release cache
		cache = null;
	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize
	};

});