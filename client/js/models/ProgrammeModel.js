// ProgrammeModel.js

define([

], function() {

	return Backbone.Model.extend({

		initialize: function() {

		},

		defaults: function() {
			return {
				id: 'no-id'
			,	title: 'no-title'
			,	shortDescription: 'no-short-description'
			,	channel: 'no-channel'
			,	subcategory: {
					id: 'no-id'
				,	name: 'no-name'
				,	category: {
						id: 'no-id'
					,	name: 'no-name'
					}
				}
			}
		}

	});



}); // define