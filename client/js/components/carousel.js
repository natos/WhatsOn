/*
* CarouselComponent
* -----------------
* @class Carousel
*/

define([

	'utils/dom'

], function(dom) {

	var name = 'carousel',

/* private */

	rowing = true,

	// dom elements
	_carousel,
	_list,

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
		_list.style.height = (window.innerWidth * 0.5625) + 'px';
	}

	function discHandler(event) {
		event.stopPropagation();
		var target = event.target;
		if ( /disc/.test(target.className) ) {
			$('.disc').removeClass('selected');
			_list.style.webkitTransform = 'translate3d(' + (target.dataset.index * -100) + '%, 0, 0)';
			//_list.style.left = target.dataset.index * -100 + '%';
			target.className = target.className + ' selected';
			timer.restart();
		}
	}

	function playpauseHandler() {
		if (rowing) { 
			timer.stop();
			$(this).find('.icon-pause').removeClass('icon-pause').addClass('icon-play');
		} else {
			timer.start();
			$(this).find('.icon-play').removeClass('icon-play').addClass('icon-pause');
		}
		rowing = !rowing;
	}

	function addButtons() {

		var playpause = $('<div>').attr('id','playpause').html('<i class="icon-pause">').on('click', playpauseHandler).appendTo(el),
			navigator = $('<div>').addClass('navigator').appendTo(el),
			disc = $('<i>').addClass('disc').addClass('icon-certificate'),
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
			programme.css({ 'left' : 100*i + '%' });

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
		
	}

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

	}

	// bounce when the limit is reached
	// for the rightswipe
	function bounceRight() {
		list.css('left', '5%');
		setTimeout(function() {
		list.css('left', '0%');
		},300);
	}
	// for the leftswipe
	function bounceLeft() {
		list.css('left', '-905%');
		setTimeout(function() {
		list.css('left', '-900%');
		},300);
	}

/* public */ 

	function initialize() {

		window.addEventListener('resize', sizeHandler);
		window.addEventListener('orientationchange', sizeHandler);

		return this;
	}

	function render() {

		_carousel = document.getElementById('featured');
		_carousel.className = 'carousel';
		_list = _carousel.getElementsByTagName('ul')[0];
		_list.className = 'show slide';

		var dataset, i = 0, img, disc,
			programme, programmes = _carousel.getElementsByTagName('li'),
			_pauseIcon = dom.create('i'),
			_playpause = dom.create('div'),
			_navigator = dom.create('div'),
			_disc = dom.create('i');

			_pauseIcon.className = 'icon-pause';
			_playpause.id = 'playpause';
			_playpause.appendChild(_pauseIcon);
			_playpause.addEventListener('click', playpauseHandler);
			_disc.className = 'disc icon-certificate';
			_navigator.className = 'navigator';

		for (i; i < programmes.length; i++) {
			programme = programmes[i];
			// position the list element
			programme.style.left = 100*i + '%';
			// deal with background images
			img = programme.getElementsByTagName('img')[0];
			dataset = img.dataset;
			if (dataset.src) {
				console.log(dataset.src);
				img.src = dataset.src;
			}
			// create a disc and addit to navigator
			disc = _disc.cloneNode(true);
			disc.setAttribute('data-index',i);
			_navigator.appendChild(disc);
		}

		// select first
		_navigator.firstChild.className = 'disc icon-certificate selected';
		_navigator.addEventListener('click', discHandler);

		// add navigator and playpause to carousel
		_carousel.appendChild(_navigator);
		_carousel.appendChild(_playpause);		

		sizeHandler();

		// start timer
		timer.start();

		return this;
	}

	function finalize() {

		// stop timer
		timer.stop();

		_navigator.removeEventListener('click', timer.restart);
		window.removeEventListener('resize', sizeHandler);
		window.removeEventListener('orientationchange', sizeHandler);

		return this;

	}

/* export */ 

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});