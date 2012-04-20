define([

], function() {

	var Carousel = {};
	
	Carousel.el = $('#topbookings'); // DOM element

	Carousel.content = $('#content');

	Carousel.map = {};

	Carousel.window = $(window);

	Carousel.coolPics = [
		'8ad586a135af96b70135afe916940151',
		'8ad586a135af96b70135afead6ef0166',
		'8ad586a135c83fb50135e242d4720a75',
		'8ad586a135af96b70135c381691a0a27',
		'8ad586a135af96b70135aff20fb801b2',
		'8ad586a135af96b70135c3910b330a31',
		'8ad586a135af96b70135afece649017b',
		'8ad586a135af96b70135aff4c1ae01db',
		'8ad586a135af96b70135aff6b58a01f0',
		'8ad586a135af96b70135aff825040205',
		'8ad586a135af96b70135b0254f4e0341',
		'8ad586a135af96b70135b033bc610391',
		'8ad586a135af96b70135b03b20bc03e2',
		'8ad586a135af96b70135b0397b5903cb',
		'8ad586a135af96b70135bf64939309ea',
		'8ad586a135af96b70135b03cce4703f5',
		'8ad586a135af96b70135bf41ffe609d3',
		'8ad586a135af96b70135be79610005ee',
		'8ad586a135af96b70135be6725af05b7',
		'8ad586a135af96b70135bf45fd6709da',
		'8ad586a135af96b70135bf50c0b809e1',
		'8ad586a135af96b70135c3cf710e0a6b',
		'8ad586a135af96b70135c3d2edf90a6f',
		'8ad586a135c83fb50135c869800b0001',
		'8ad586a135af96b70135bed29b9f078c',
		'8ad586a135af96b70135bec8927d0730',
		'8ad587a135e838d50135ee54544f075c',
		'8ad587a135c42a2c0135c4fcb2980053',
		'8ad586a135c83fb50135c87e4ace0011',
		'8ad586a135c83fb50135c87d21f9000c',
		'8ad586a135c83fb50135c8795ab80008',
		'8ad586a135af96b70135c3e20a470a7c',
		'8ad586a135af96b70135bf7cd35a09f7'
	];

	Carousel.initialize = function() {

		this.list = this.el.find('.show');

		var self = this;

		var sizeHandler = function() {
			// The images are in 16:9 aspect ratio. Limit height to no more than 400px.
			// (Height limit is just so that the channel list remains visible even on very
			// wide screens.)
			self.list.css({'height': Math.min(400, (self.window.width() * 0.5625)) + 'px'});
		}

		this.window.bind('resize orientationchange', sizeHandler);

		sizeHandler();

		this.list.addClass('slide');

		this.loadButtons();

		return this;
	};


	Carousel.loadButtons = function() {

		var self = this;

		var buttons = $('<div>').addClass('navigator').appendTo(this.el),
			button = $('<div>').addClass('disc'),
			programme,
			maxScreenWidth = Math.max(this.window.width(), this.window.height()),
			imgSize;

		this.list.find('.programme').each(function(i, e) {

			programme = $(e);

			programme.css({
				'left' : 100*i + '%'
			});

			if (maxScreenWidth <= 320) {
				imgSize = 's';
			} else if (maxScreenWidth <= 480) {
				imgSize = 'm'
			} else if (maxScreenWidth <= 1024) {
				imgSize = 'l'
			} else {
				imgSize = 'xl'
			}

			programme.append('<img class="programme-bg" src="/assets/programmes/' + imgSize + '/' + self.coolPics[i] + '.jpg" />');

			self.map['disc-' + i] = button
				.clone()
				.data('index', i)
				.click(function(event) {
					self.list.css('left', $(this).data('index') * -100 + '%' );
					$('.disc').removeClass('selected');
					$(this).addClass('selected');
				})
				.appendTo(buttons);
		});		

		// select first
		$('.disc').first().addClass('selected');
	};

	return Carousel;

});