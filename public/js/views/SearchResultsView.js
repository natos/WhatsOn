// SearchResultsView.js

define([

	'js/libs/timer/timer.js'

],

function() {

// private scope
var timer = new Timer('Search Results View');
// end private scope

	return Backbone.View.extend({

	// $ shortcuts

		el: $('#content')

	,   window: $(window)

	,	filters: $('#filters')

	,	initialize: function() {

			timer.track('Initialize');

			this.filters.bind('click', this.handleFilter);

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			this.trigger('view-created');

			timer.track('Finish Load');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	handleFilter: function(event) {

			var el = event.target;
			var klass = $(el).parents('li').attr('class');
			var value = el.value;

			if (!klass) { return; }

			var results = $('#search-results').find("li[data-" + klass + "='" + value + "']").toggle();

		}

	});

}); // define