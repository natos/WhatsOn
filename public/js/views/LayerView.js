// LayerView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('<div class="layer">') // DOM element

	,	content: $('#content')

	,   window: $(window)

//	,	template: _.template( template )

	,	initialize: function() {

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.el.html('<div class="loader"></div>');

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

			return this;

		}

	,	show: function(event) {

			this.event = event;

			this.el
				.hide()
				.html('<div class="loader"></div>')
				.load(this.event.target.href, 'body')
				.css({
					'top': this.event.pageY + 'px'
				,	'left': this.event.pageX + 'px'
				})
				.appendTo(this.content)
				.fadeIn();

			return this;

		}

	,	hide: function() {

			this.el.remove();

			return this;

		}

	});

}); // define