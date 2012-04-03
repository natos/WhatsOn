// LayerView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('<div class="layer">') // DOM element

	,	content: $('body')

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

	,	show: function(event, href) {

			var self = this;

			this.event = event;

/*			console.log(event);

			var clientX = event.clientX
			,	clientY = event.clientY;

			$('<div></div>')
				.html('asdasdasd')
				.css({
					'position': 'fixed'
				,	'top': clientX + 'px'
				,	'left': clientY + 'px'
				,	'width': '100px'
				,	'height': '100px'
			}).append('#content');
*/

			if (!href) { 
				this.hide();
				return;
			}

			$('<div class="dimmer"><div>')
				.hide()
				.click(this.hide)
				.appendTo(this.content)
				.fadeIn();

			this.el
				.hide()
				.html('<div class="loader"></div>')
				.load(href, 'body', function(){

					var closeBtn = $('<div class="close">x</div>')
						.click(self.hide);

					$(this).find('header').append(closeBtn);

				})
//				.css({
//					'top': this.event.pageY + 'px'
//				,	'left': this.event.pageX + 'px'
//				})
				.appendTo(this.content) 
				.fadeIn(); // not perfom well TODO: use transitions or something else

			return this;

		}

	,	hide: function() {

			$('.layer, .dimmer').fadeOut(function(){ $(this).remove() }); // TODO: change jquery fx 

			return this;

		}

	});

}); // define