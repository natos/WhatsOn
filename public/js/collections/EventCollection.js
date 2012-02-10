// EventCollection.js

define([

	// Dependencies

	'models/EventModel'

],

function(EventModel) {

	return Backbone.Collection.extend({

		model: EventModel,

		initialize: function() {

		}

	});


}); // define