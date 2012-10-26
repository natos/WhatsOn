/* 
* SearchController 
* --------------
*
*/

define([

	'modules/zepto',
	'config/search',
	'modules/event',
	'lib/flaco/controller',
	'models/search',
	'views/search'

], function SearchController($, searchConfig, Event, Controller, searchModel, searchView) {

	var name = 'search';

/* private */

	var onSearchFor = function(q) {
		var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Event.json?query=' + q + '&callback=?';
		$.getJSON(request, handleSearchResponse);
	};

	var handleSearchResponse = function(apiResponse) {
		searchModel.set('searchResults', apiResponse);
	};

/* public */

/* abstract */

	function initialize() {

		Event.on(searchConfig.SEARCH_FOR, onSearchFor);
		return this;

	}

	function finalize() {

		Event.off(searchConfig.SEARCH_FOR, onSearchFor);
		return this;

	}

/* export */

	return new Controller({
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: searchView
	});

});