// EventView.js

define([

],

function() {

	return Backbone.View.extend({

		initialize: function(data) {

			if (!data) return;

			this.el = $('<div>');

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.el
				.addClass('event')
				.attr('id', this.options.id)
				.attr('title', this.options.programme.title)
				.html('<a id="' + this.options.programme.id + '" class="programme" href="/programme/' + this.options.programme.id + '.html">' + this.options.programme.title + '</a>' + '<p class="description">' + this.options.programme.shortDescription + '</p>')
				.css({
					'position': 'absolute'
				,	'top': this.options.offset.top + 'px'
				,	'left': this.options.offset.left + 'px'
				,	'width': this.options.width + 'px'
				})
				.appendTo('#grid-container');

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

			return this;

		}

	,	remove: function() {

			this.unload();

			this.el.remove();

			return this;
		}

	});

}); // define