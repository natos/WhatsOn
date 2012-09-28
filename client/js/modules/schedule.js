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

		cache = {},

		// This hardcode value should be configurable
		// somewhere, or use geolocation somehow
		COUNTRY = 'Nederland';

/* private */

	/* Handle data comming from the API */

	Event.on(a.COUTRIES_RECEIVED, function(response) { 

		processResponse(response, a.COUNTRIES_CACHE);

	});

	Event.on(a.CATEGORIES_RECEIVED, function(response) {

		processResponse(response, a.CATEGORIES_CACHE);

	});

	Event.on(a.LINEUP_RECEIVED, function(response) {

		processResponse(response, a.LINEUP_CACHE);

	});

	Event.on(a.MODEL_CHANGED, function(changes) {

		// Once we got countries information
		if (changes[a.COUNTRIES_CACHE]) {
			// get channel Lineup
			getLineup();
			// get categories
			getCategories();
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

	function getCategories() {

		var country, request;

		for (var i = 0, t = cache[a.COUNTRIES_CACHE].data.length; i < t; i++) {
			
			country = cache[a.COUNTRIES_CACHE].data[i];
			
			// Here is where the app decides 
			// wich country schedule to use
			if (country.name === COUNTRY) {

				request = country.schedules.data[0].selfLink.href.split('?')[0];

				// The URL to get categories is kind of weird, talk with Jedrzej about this...
				// To get categories, we actually are requesting schedules as main object,
				// that make the recursion really difficult, and the nextBatches are really short.
				// http://api.lgi.com/alpha/schedules/upc.nl.json?show=name,categories.selfLink,selfLink&maxBatchSize=4
				// It would be great if I could query categories as primary object:
				// http://api.lgi.com/alpha/schedules/upc.nl/categories.json?show=name,selfLink,subcategories.name&maxBatchSize=4

				// get Nederland categories
				//EpgApi.getCategoriesFromAPI(request);


				// awful temporary solution

				request += '?show=categories.name,selfLink&maxBatchSize=4'

				$.getJSON(request + '&callback=?', function(response) {

					cache[a.CATEGORIES_CACHE] = response.data[0].categories;
					
					var categories = response.data[0].categories;
					
					if (categories && categories.nextBatchLink && categories.nextBatchLink.href) {
						EpgApi.getCategoriesFromAPI(categories.nextBatchLink.href);
					}
				});

				// stop iteration
				break;

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
		delete cache;
	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize
	};

});