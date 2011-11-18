// NowAndNextCollection.js

define([

	// Dependencies

	'models/NowAndNextModel'

],

function(NowAndNextModel) {

	return Backbone.Collection.extend({

		model: NowAndNextModel,

		initialize: function(a) {

		}

	});


}); // define