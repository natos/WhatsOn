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

			var self = this;

			this.collection = Source.getNowAndNextCollection();

			wo.events.bind('get-nowandnext-collection', this.load, this);

			this.trigger('view-initialized', this);

		}

,		load: function( collection ) {

			this.collection = collection || this.collection;

			this.el.html( this.template( this.collection ) );

			this.trigger('view-created', this);

		}

,		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.el.trigger('view-unloaded', this);

		}

,		listItemClickHandler: function(event) {

			$('#controls').remove();

			var control = $('<div id="controls"></div>');
			var btnShare = $('<button>Share</button>');
			var btnRecord = $('<button>Record</button>'); 

			control.append(btnShare).append(btnRecord);

			$(this).append(control);

		}

	});

}); // define