// ItemModel.js

define([

], function() {

	return Backbone.Model.extend({

		initialize: function() {

		},

		defaults: function() {
			return {
				start: 0
			,	title: 'no-title'
			,	description: 'no-description'
			,	channel: 'no-channel'
			}
		}

	});



}); // define