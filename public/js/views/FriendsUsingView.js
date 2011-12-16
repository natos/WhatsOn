// FriendsUsingView.js

define([

	'templates/FriendsUsingTemplate'

],

function(template) {

	return Backbone.View.extend({

		el: $('#friends-using-app')

,		template: _.template( template )

,		initialize: function() {

			var self = this;

			this.load()

			this.trigger('view-initialized', this);

		}

,		load: function() {

			this.el.html( this.template() );

			// when a friend is received from the backend, add it to the page
			wo.socket.on('friend-using-app', function(friend) {
				$('#friends-using-app ul').append('                                                       \
					<li>                                                                                  \
						<a href="http://www.facebook.com/' + friend.uid + '" title="' + friend.name + '"> \
							<img src="' + friend.pic_square + '" alt="' + friend.name + '">               \
						</a>                                                                              \
					</li>                                                                                 \
          		');
			});

			wo.socket.emit('friend-using-app');

			this.trigger('view-created', this);

		}

,		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.el.trigger('view-unloaded', this);

		}

	});

}); // define