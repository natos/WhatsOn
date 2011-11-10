// ListCollection.js

define([

	// Dependencies

	'models/ItemModel',
	'views/ListView'

], function(ItemModel, ListView) {

	return Backbone.Collection.extend({

		model: ItemModel,

		initialize: function() {

			this.view = new ListView;

		},

		refresh: function() {

			this.view.render( this );

		}
	
	});


}); // define