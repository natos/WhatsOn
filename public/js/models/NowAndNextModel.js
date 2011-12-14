// NowAndNext.js

define([

], function() {

	return Backbone.Model.extend({

		initialize: function() {

		},

		defaults: function() {
			return {
				start: 0
			,	channel: {
					name: 'no-name'
				,	logoIMG: 'no-image'
				,	url: 'no-url'
				}
			,	programme: {
					title: 'no-title'
				,	shortDescription: 'no-shortDescription'
				}
			,	url: 'no-url'
			}
		}

	});

}); // define