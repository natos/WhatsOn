// AllChannelsCollection.js

define([

	// Dependencies

	'models/ChannelModel'

],

function(ChannelModel) {

	return Backbone.Collection.extend({

		model: ChannelModel,

		initialize: function() {

		}

	});


}); // define