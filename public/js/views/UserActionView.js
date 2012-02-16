// UserActionView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#user-action')

	,	events: {

			'click button.watch': watch

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

			FB.api('/me/upcwhatson:watch', 'post', { 'video.tv_show' : $('meta[property="og:url"]').attr('content') });

		}

	});

}); // define