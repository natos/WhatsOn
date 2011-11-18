// TopBookingsCollection.js

define([

	// Dependencies

	'models/ProgrammeModel'

],

function(ProgrammeModel) {

	return Backbone.Collection.extend({

		model: ProgrammeModel,

		initialize: function(a) {

		}

	});


}); // define