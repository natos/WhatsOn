// UserActionView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#user-action')

	,	events: {

			'click button.watch': 'watch'
			'click button.share': 'share'

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

	,	share: function(event) {

			var url = $('meta[property="og:url"]').attr('content');
			var title = $('meta[property="og:title"]').attr('content');
			var description = $('meta[property="og:description"]').attr('content');

			FB.ui({
				method: 'feed'
			,	link: url
			,	picture: 'http://upcwhatson.herokuapp.com/assets/upclogo.jpg'
			,	name: 'Share TV Show'
			,	caption: title
			,	description: description
			}, 
			function(reposne) {
				console.log(reponse);
			});

		}


	});

}); // define