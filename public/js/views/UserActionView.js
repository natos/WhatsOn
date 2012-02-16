// UserActionView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#user-action')

	,	events: {

			'click button.watch': 'watch'

		}

	,	initialize: function() {

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

			console.log(event)
			console.log( $('meta[property="og:url"]').attr('content') );
			var query = prompt('Query','/me/upc-whatson');
//			FB.api('/me/upc-whatson:Watch', 'post', { 'video.tv_show' : $('meta[property="og:url"]').attr('content') });
//			FB.api('/me', function(response){ console.log(response); });
			FB.api( query, function(response){
				console.log(response);
			});

		}

	});

}); // define