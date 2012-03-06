// TopBookingsView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#topbookings') // DOM element

	,	cool_pics: [

			'http://tv.sky.com/asset/show/8ad586a135af96b70135afe916940151.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135afead6ef0166.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135e242d4720a75.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c381691a0a27.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff20fb801b2.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c3910b330a31.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135afece649017b.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff4c1ae01db.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff6b58a01f0.jpg'
		,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff825040205.jpg'

	]

	,	content: $('#content')

	,	map: {}

	,	initialize: function() {

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.list = this.el.find('.show');

			this.list.addClass('slide');

			this.loadButtons();

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.remove();

			this.trigger('view-unloaded', this);

			return this;

		}

	,	loadButtons: function() {

			var self = this;

			var buttons = $('<div>').attr('id','navigator').appendTo(this.el)
			,	button = $('<div>').addClass('disc')
			,	programme
			,	width
			,	left;

			this.list.find('.programme').each(function(i, e){

				programme = $(e);

				width = programme.outerWidth();

				left = width * i;

				programme.css({
					'background'	: 'transparent url("' + self.cool_pics[i] + '") 0 0 no-repeat'
				,	'left'			: width*i + 'px'
				});

				self.map['disc-'+left] = button
					.clone()
					.data('move', left)
					.click(function(event) {
						self.list.css('left', $(this).data('move') * -1 + 'px' );
						$('.disc').removeClass('selected');
						$(this).addClass('selected');
					})
					.appendTo(buttons);

			});		

			this.list.css('width', left + width + 'px');

			// select first
			$('.disc:first').addClass('selected');

		}

	,	discHandler: function(event) {


		}

	});

}); // define