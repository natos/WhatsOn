// UserActionView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#user-action')

	,	events: {

			'click button.watch': 'watch'
		,	'click button.share': 'share'

		}

	,	initialize: function() {

			this.content = $('meta[property="og:url"]').attr('content');
			this.objectType = $('meta[property="og:type"]').attr('content');

			this.graph = {};
			this.graph[this.objectType] = this.content;

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			var self = this;

			this.trigger('view-created');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	watch: function(event) {

			this.graph['access_token'] = wo.views.usercontrol.facebook.accessToken;

			console.log(this.graph);

			FB.api('/me/video:watches', 'post', this.graph,	function(response) {
				console.log(response);
			});

/*
			curl -F 			'access_token=AAACLcMgBBscBAGI1QmoIp4HrQAJFZAuv2OEVm5gUn3XTX1RXlb1H0thCVNE9AZCKfixUINZByeKufXoQit4YjZBsbZAryoAoY7gnihF1dRl9r8H4Lud7E' \
			     -F 'movie=http://example.com' \
        		'https://graph.facebook.com/me/video.watches'
*/

		}

	,	share: function(event) {

			var url = $('meta[property="og:url"]').attr('content');
			var title = $('meta[property="og:title"]').attr('content');
			var description = $('meta[property="og:description"]').attr('content');

			FB.ui({
				method: 'feed'
			,	link: url
			,	picture: 'http://upcwhatson.herokuapp.com/assets/upclogo.jpg'
			,	name: title
			,	caption: 'What\'s on UPC'
			,	description: description
			}, 
			function(reposne) {
				console.log(reponse);
			});

		}


	});

}); // define