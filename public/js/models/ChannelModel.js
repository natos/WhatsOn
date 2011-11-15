// ChannelModel.js

define([

], function() {

	return Backbone.Model.extend({

		initialize: function() {

		},

		defaults: function() {
			return {
				id: 'no-id'
			,	name: 'no-name'
			,	description: 'no-description'
			,	logoIMG: 'no-image'
			,	position: 'no-position'
			,	broadcastFormat: 'no-broadcastformat'
			,	apiChannelGroupId: 'no-apichannelgroupid'
			}
		}

	});



}); // define