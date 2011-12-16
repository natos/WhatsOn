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

			console.log(event.target.className);
			var action = event.target.className;

			switch (action) {
				case 'btn-share':
					console.log('sharing');
					break;
				case 'btn-checkin':
					console.log('checkin');
					break;					
			}

		}

	});

}); // define