/* 
* AppModule 
* ---------
*
* Control the app
*
*/

define([

	'/js/lib/event/event.js',
	'utils/channel',
	'models/channel',
	'models/grid',
	'models/user'

], function AppModuleScope(EventEmitter, ChannelUtils, ChannelModel, GridModel, UserModel) {

/* private */

/* public */

	/* App extends EventEmitter */
	var App = new EventEmitter();

		/* Modules namespace */
		App.modules = {};
		
	/* constructor */
	function initialize() {

		// Fetch channels and Load Modules
		ChannelUtils.fetchAnd(function loadModules(channels) {
			// save the channels in the global scope // don't like this // backwards compatibility
			// and into the App namespace
			window.channels = App.channels = channels;
			// Load the primary modules for the app.
			// Each module must have an "initialize" method that returns the module itself.
			require(['modules/user', 'modules/canvas', 'modules/router'], function initializeModules() {
				while (module = Array.prototype.shift.apply(arguments)) { App.modules[module.name] = module.initialize(); } 
			});
		});

		return App;
	
	}

	function loadCss(url) {
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}

	/**
	 * Return a list of channels based on the specified Filter group id.
	 * Make sure the main channels list is populated first, by calling populateChannels()!
	 * TODO: Remove this method
	 */
	function getChannelsByFilterGroup(groupId) {
		var channels = App.channels;
		var channelsSubset = [];
		var i, j, count, channel, domain;

		for (i=0, count=channels.length; i<count; i++) {
			channel = channels[i];
			if (channel && channel.domains) {
				j = channel.domains.length;
				while(j) {
					j = j-1;
					if (channel.domains[j].id==='Filter') {
						if (channel.domains[j].groups.indexOf(groupId) >=0) {
							channelsSubset.push(channel);
						}
						break;
					}
				}
			}
		}

		return channelsSubset;
	}

	/* public */

	App.name = 'UPC Social';
	App.initialize = initialize;
	App.loadCss = loadCss;	// * TODO: Remove this method
	App.getChannelsByFilterGroup = getChannelsByFilterGroup;	// * TODO: Remove this method
	App.models = {
		channel	: ChannelModel, 
		grid 	: GridModel,
		user	: UserModel
	}

	return App;

});