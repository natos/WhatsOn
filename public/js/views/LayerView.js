// LayerView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('<div class="layer">') // DOM element

	,	content: $('#content')

	,   window: $(window)

//	,	template: _.template( template )

	,	initialize: function(event) {

			this.event = event;

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			this.el.html('<div class="loader"></div>');

			this.el.load(this.event.target.href, 'body');

			this.trigger('view-created');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	show: function() {

			this.el.appendTo(this.content);

		}

	});

}); // define