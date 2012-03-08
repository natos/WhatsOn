// EventModel.js

define([

], function() {

	return Backbone.Model.extend({

		initialize: function() {

		},

		defaults: {
			id: 'no-id'
		,	startDateTime: 'no-start-date'
		,	endDateTime: 'no-stop-date'
		,	channel: {
				id: 'no-id'
			,	name: 'no-name'
			}
		,	programme: {
				id: 'no-id'
			,	title: 'no-title'
			,	shortDescription: 'no-short-description'
			}
		}

	});



}); // define