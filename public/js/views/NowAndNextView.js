// NowAndNextView.js

define([

	'sources/NowAndNextSource',
	'templates/NowAndNextTemplate'

],

function(Source, template) {

	return Backbone.View.extend({

		el: $('#content')

,		btn: $('a[href=#nowandnext]')

,		template: _.template( template )

,		initialize: function() {

			this.collection = Source.getNowAndNextCollection();

			wo.events.bind('get-nowandnext-collection', this.load, this);

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

			var getShowData = function(event) {

				var li = $(event.target).parents('li');

				return {
					date		: li.find('date').html()
				,	image		: li.find('img').attr('src')
				,	channel		: li.find('img').attr('alt')
				,	title		: li.find('h2').html()
				,	description : li.find('p').html()
				};

			}

			var action = event.target.className;

			var show = getShowData(event);

			switch (action) {

				case 'btn-tell-a-friend':

					FB.ui({
						method: 'send'
					,   name		: show.title
					,   link		: 'http://upcwhatson.herokuapp.com/'
					,   picture		: show.image
					,   caption		: 'See it on ' + show.channel + ' started ' + show.date
					,   description	: show.description
					});

					break;

				case 'btn-checkin':

					FB.ui({
					    method		: 'feed'
					,   name		: 'Checking in ' + show.title
					,   link		: 'http://upcwhatson.herokuapp.com/'
					,   picture		: show.image
					,   caption		: 'See it on ' + show.channel + ' started ' + show.date
					,   description	: show.description
					});

					break;					
			}

		}

	});

}); // define