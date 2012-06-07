/*
* CarouselComponent
* -----------------
* @class Carousel
*/

define([

], function() {

	var name = 'carousel';

/* private */

	var $window = $(window),

	el, 

	list,

	timer = {
		clock: void 0,
		time: 5000, // time to slide
		status: false,
		start: function() {
			timer.status = true;
			timer.clock = setTimeout(timer.tick, timer.time);
		},
		tick: function() {

			if (!timer.status) { return; }

			var disc = $('.disc.selected').next();

			if (!disc[0]) {
				$('.disc').first().trigger('click');
			} else {
				disc.trigger('click');
			}

			timer.restart();

		},
		restart: function() {
			timer.stop();
			timer.start();
		},
		stop: function() {
			timer.status = false;
			timer.clock = clearTimeout(timer.clock);
		}
	};

	function sizeHandler() {
		// The images are in 16:9 aspect ratio. Limit height to no more than 400px.
		// (Height limit is just so that the channel list remains visible even on very
		// wide screens.)
		list.css({'height': ($window.width() * 0.5625) + 'px' });
	};

	function discHandler(event) {
		var $this = $(this);
		event.stopPropagation();
		list.css('left', $this.data('index') * -100 + '%' );
		$('.disc').removeClass('selected');
		$this.addClass('selected');
	};

	function addButtons() {

		var navigator = $('<div>').addClass('navigator').appendTo(el),
			disc = $('<i>').addClass('disc').addClass('icon-stop'),
			maxScreenWidth = Math.max($window.width(), $window.height()),
			programme,
			imgSize,
			src;

			if (maxScreenWidth <= 320) {
				imgSize = 's';
			} else if (maxScreenWidth <= 480) {
				imgSize = 'm';
			} else if (maxScreenWidth <= 1024) {
				imgSize = 'l';
			} else {
				imgSize = 'xl';
			}

		list.find('.programme').each(function(i, e) {

			programme = $(e);

			programme.css({
				'left' : 100*i + '%'
			});

			//programme.prepend('<img class="programme-bg" src="/assets/programmes/' + imgSize + '/' + coolPics[i] + '.jpg" />');

			var $bg = programme.find('.programme-bg'),
				src = $bg.attr('src');
				src = src.replace('/s/', '/' + imgSize + '/');
				$bg.attr('src', src);

			map['disc-' + i] = disc
				.clone()
				.data('index', i)
				.click(discHandler)
				.appendTo(navigator);
		});		

		// select first
		$('.disc').first().addClass('selected');

		// add touch events
		el.on('swipeRight swipeLeft', swipe);

		// restart timer every disc click
		$('.disc').bind('click', timer.restart );
		
	};

	// swipe handler
	function swipe(event) {

		var bounce, disc = $('.disc.selected');

		// restart timer
		timer.restart();

		switch(event.type) {

			case "swipeRight": 
				bounce = bounceRight;
				disc = disc.prev();
				break;
			case "swipeLeft": 
				bounce = bounceLeft;
				disc = disc.next();
				break;
		}

		if (!disc[0]) {
			bounce();
		} else { 
			disc.trigger('click');
		}

	};

	// bounce when the limit is reached
	// for the rightswipe
	function bounceRight() {
		list.css('left', '5%');
		setTimeout(function(){
		list.css('left', '0%');
		},300);
	};
	// for the leftswipe
	function bounceLeft() {
		list.css('left', '-905%');
		setTimeout(function(){
		list.css('left', '-900%');
		},300);
	};

/* public */ 

	var el, list, map = {};

	function initialize() {

		$window.on('resize orientationchange', sizeHandler);

		return this;
	};

	function render() {

		console.log('RENDERING CAROUSEL');

		el = $('#featured').addClass('carousel');

		list = el.find('.show').addClass('slide');

		sizeHandler();

		addButtons();

		// start timer
		timer.start();

		return this;
	};

	function finalize() {

		// stop timer
		console.log(timer.stop());

		$window.off('resize orientationchange', sizeHandler);

		return this;

	};

/* export */ 

	return {
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render,
		map: map
	}

});