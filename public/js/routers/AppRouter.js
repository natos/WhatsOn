// AppRouter.js

define([

	'views/TopBookingsView'
,	'views/AllChannelsView'
,	'views/ChannelView'
,	'views/ProgrammeView'

,	'views/NowAndNextView'
,	'views/SpecificView'

,	'js/libs/iscroll.js'

],

function(TopBookingsView, AllChannelsView, ChannelView, ProgrammeView, NowAndNextView, specificview) {

	return Backbone.Router.extend({
		
		// To know which view is the current
		current: undefined

		// Declaring all app routes here
		// "someview": "somehandler"
	,	routes: {

			"allchannels"	: "allchannels"
/*		,	"topbookings"	: "topbookings"
		,	"nowandnext"	: "nowandnext"
		,	"specificview" 	: "specificview"*/

		,	"channel/:c"	: "channel"
		,	"programme/:p"	: "programme"
		}

	,	channel: function(id) {
			this.load('channelview'+id, ChannelView, id);
		}

	,	programme: function(id) {
			this.load('programmeview'+id, ProgrammeView, id);
		}

	,	specificview: function(){
			this.load('specificview', specificview);
			console.log(new specificview)
		}

		// Some handlers...
	,	nowandnext: function() {
			this.load('nowandnext', NowAndNextView)
		}

	,	allchannels: function() {
			this.load('allchannels', AllChannelsView)
		}

	,	topbookings: function() {
			this.load('topbookings', TopBookingsView)
		}

		// Generic view loader
	,	load: function(namespace, View, id) {

			// unload current view
			if (this.current) {
				wo.views[this.current].unload();
			}
			// set the new current
			this.current = namespace;

			// Try to grab the view from the cache
			if (wo.views[namespace]) {
				wo.views[namespace].load(id);
				return;
			}

			// Create the requested view
			wo.views[namespace] = new View(id);
			wo.views[namespace].bind('view-created', function() {
				// When a new view is loaded, distroy existing scroll object
				//if (wo.scroll) { wo.scroll.destroy() } 
				// Then create a new scroll to calculate every detail again
				//wo.scroll = new iScroll('content');
			});
		}

	});

}); // define