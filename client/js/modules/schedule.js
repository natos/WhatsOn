/* 
* ScheduleModule
* --------------
* Pre-fetchs all the necesary data
* to run the App.
*/

define([

	'config/app',
	'models/app',
	'modules/event',
	'utils/epgapi'

], function ScheduleModuleScope(a, AppModel, Event, EpgApi) {

	var name = 'schedule',

/* private */

		cache = {},

		// hardcode value for country
		COUNTRY = 'Nederland',

		// hardcode value for schedule
		SCHEDULE = 'upc.nl';

	/* Handle data comming from the API */

	Event.on(a.COUTRIES_RECEIVED, function(response) { 

		processResponse(response, a.COUNTRIES_CACHE);

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
			// get schedule data
			getSchedules();
			// get channel Lineup
			getLineup();
		}

		if (changes[a.SCHEDULES_CACHE]) {
			// get categorires and genres
			getCategoriesAndGenres();
		}

		if (cache[a.LINEUP_CACHE] && cache[a.CATEGORIES_CACHE]) {
			// Ready to Rock!
			Event.emit(a.READY);
		}
	});

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

			AppModel.set(label, cache[label]);

		}
	}

	function getLineup() {

		var country, request;

		for (var i = 0, t = cache[a.COUNTRIES_CACHE].data.length; i < t; i++) {
			
			country = cache[a.COUNTRIES_CACHE].data[i];
			
			// Here is where the app decides 
			// wich country schedule to use
			if (country.name === COUNTRY) {

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
			if (country.name === COUNTRY) {

				request = country.schedules.data[0].selfLink.href.split('?')[0];

				EpgApi.getSchedulesFromAPI(request);
			}
		}
	}

	function getCategoriesAndGenres() {

		var schedule, request;

		for (var i = 0, t = cache[a.SCHEDULES_CACHE].data.length; i < t; i++) {

			schedule = cache[a.SCHEDULES_CACHE].data[i];

			if (schedule.id === SCHEDULE) {

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
		}
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