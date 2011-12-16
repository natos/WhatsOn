// NowAndNextView.js

define([

	'sources/NowAndNextSource',
	'templates/NowAndNextTemplate'

],

function(Source, template) {

	return Backbone.View.extend({

		el: $('#content')

,		template: _.template( template )

,		initialize: function() {

			var self = this;

			this.collection = Source.getNowAndNextCollection();

			wo.event.bind('get-nowandnext-collection', this.load, this);

			this.trigger('view-initialized', this);

		}

,		load: function( collection ) {

			this.collection = collection || this.collection;

			this.el.html( this.template( this.collection ) );

			this.el.find('button').click( this.clickHandler );

			this.trigger('view-created', this);

		}

,		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.el.trigger('view-unloaded', this);

		}

,		clickHandler: function(event) {

			var action = event.target.className;

			var show = this.getShowData(event);

			switch (action) {

				case 'btn-share':

					FB.ui({
					    method		: 'feed'
					,   name		: show.title
					,   link		: 'http://upcwhatson.herokuapp.com/'
					,   picture		: show.image
					,   caption		: 'See it on ' + show.channel + ' started ' + show.date
					,   description	: show.description
					},
					function(response) {
						if (response && response.post_id) {
						//      alert('Post was published.');
						} else {
						//      alert('Post was not published.');
						}
					});

					break;

				case 'btn-checkin':
					wo.socket.emit('checkin');
					break;					
			}

		}

,		getShowData: function(event) {

			var li = $(event.target).parents('li');
			var show = {
				date		: li.find('date').html()
			,	image		: li.find('img').attr('src')
			,	channel		: li.find('img').attr('alt')
			,	title		: li.find('h2').html()
			,	description : li.find('p').html()
			};

			return show;
		} 

	});

}); // define