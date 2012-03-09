// HeaderSearchFormView.js
// Defines the Backbone view for the search form in the header of the page.

define([
	'sources/EventSearchSource'
],

function(EventSearchSource) {

	return Backbone.View.extend({

		el: $('#search')

	,	events: {
			'submit' : 'performSearch'
		}

	,	initialize: function() {
		}

	,	performSearch: function(e) {
		}

	});

}); // define