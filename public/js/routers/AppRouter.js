// AppRouter.js

// TODO: DRY here please.

define([

	'views/TopBookingsView',
	'views/AllChannelsView'
],

function(TopBookingsView, AllChannelsView) {

	return Backbone.Router.extend({

		routes: {
			"home" : "home",
			"topbookings": "topbookings",
			"allchannels": "allchannels"
		},

		allchannels: function(){

			console.log('All Channels');
			console.log(wo)
			if (!wo.views['allchannels']) {
				wo.views.allchannels = new AllChannelsView();
			} else {
				wo.views.allchannels.select();
			}

		},

		topbookings: function(){

			console.log('Top Bookings');

			if (!wo.views.topbookings) {
				wo.views.topbookings = new TopBookingsView();
			} else {
				wo.views.topbookings.select();
			}			
		}

	});

}); // define