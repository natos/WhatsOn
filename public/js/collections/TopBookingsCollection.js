// TopBookingsCollection.js

define([

	// Dependencies

	'models/ItemModel'

],

function(ItemModel) {

	return Backbone.Collection.extend({

		model: ItemModel,

		initialize: function(a) {

		}

	});


}); // define