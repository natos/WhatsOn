/*
* CarouselComponent
* -----------------
* @class Carousel
* TODO: Swipe events to navigate the carousel content
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