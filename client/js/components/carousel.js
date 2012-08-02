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

	DISC_CLASS = 'disc icon-certificate',
	SELECTED_CLASS = ' selected',

	transform,
	rowing = true,

	// dom elements
	_navigator,
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
			// avoid ticking if we are off
			if (!timer.status) { return; }
			// grab the selected disc
			var disc, i = 0;
			for (i = 0; i < _navigator.children.length; i++) {
				if (/selected/.test(_navigator.children[i].className)) {
					disc = _navigator.children[i];
				}
			}
			// if somehow the reference is lost return
			if (!disc) { return; }

			// if there's a next sibling
			// else use the first disc
			if (disc.nextSibling) {
				disc.nextSibling.click();
			} else {
				_navigator.firstChild.click();
			}

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

	function getTransformProperty(element) {
	    // Note that in some versions of IE9 it is critical that
	    // msTransform appear in this list before MozTransform
	    var p, properties = ['transform', 'WebkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
	    while (p = properties.shift()) { if (typeof element.style[p] != 'undefined') { return p; } }
	    return false;
	}

	function sizeHandler() {
		// The images are in 16:9 aspect ratio. Limit height to no more than 400px.
		// (Height limit is just so that the channel list remains visible even on very
		// wide screens.)
		_list.style.height = (window.innerWidth * 0.5625) + 'px';
	}

	function discHandler(event) {
		event.stopPropagation();
		var target = event.target, transform, property, opera, i = 0;
		var dataset;
		if ( /disc/.test(target.className) ) {
			// slide list to the disc index * -1 * 100%
			// just because I need a negative number
			dataset = dom.getDataset(target);
			slide(_list).to(dataset.index * -1); // I need a negative value
			// remove selected class from all others
			for (i = 0; i < _navigator.children.length; i++) { _navigator.children[i].className = DISC_CLASS; }
			// select current target
			target.className = target.className + SELECTED_CLASS;
			timer.restart();
		}
	}

	function playpauseHandler() {
		if (rowing) {
			timer.stop();
			this.getElementsByTagName('i')[0].className = 'icon-play';
			//$(this).find('.icon-pause').removeClass('icon-pause').addClass('icon-play');
		} else {
			timer.start();
			this.getElementsByTagName('i')[0].className = 'icon-pause';
			//$(this).find('.icon-play').removeClass('icon-play').addClass('icon-pause');
		}
		rowing = !rowing;
	}

	/*
	*	Slide an element, to a percentage point
	*	Use: slide(DOMElement).to(int);
	*/
	function slide(element) {
		var opera, property;
		// Opera doesn't support translate3d with JavaScript
		opera = (transform === 'OTransform');
		property = (opera) ? 'translateX' : 'translate3d';

		function toPoint(point) {
			element.style[transform] = property + '(' + (100*point) + ((opera) ? '%)' : '%, 0, 0)');
		}

		return { // yeah, I like currying
			to: toPoint
		}
	}

/* public */ 

	function initialize() {

		window.addEventListener('resize', sizeHandler);
		window.addEventListener('orientationchange', sizeHandler);

		return this;
	}

	function render() {

		_carousel = document.getElementById('featured');

		// first time load render the component
		// avoid re-renderings, templating is in
		// charge of saving the DOMFragment
		if (_carousel.className === 'no-carousel') {
			_carousel.className = 'carousel';
			_list = _carousel.getElementsByTagName('ul')[0];
			_list.className = 'show slide';

			// define the kind of transformation
			// this is because we normally use
			// translate3d and opera doesn't support it
			transform = getTransformProperty(_list);

			var dataset, i = 0, img, disc,
				programme, programmes = _carousel.getElementsByTagName('li'),
				_pauseIcon = dom.create('i'),
				_playpause = dom.create('div'),
				_disc = dom.create('i');
				_navigator = dom.create('div');

				_pauseIcon.className = 'icon-pause';
				_playpause.id = 'playpause';
				_playpause.appendChild(_pauseIcon);
				_playpause.addEventListener('click', playpauseHandler);
				_disc.className = DISC_CLASS;
				_navigator.className = 'navigator';

			for (i; i < programmes.length; i++) {
				programme = programmes[i];
				// position the list element
				//programme.style[transform] = property + '(' + (100*i) + ((opera) ? '%)' : '%, 0, 0)');
				slide(programme).to(i); // nice eh?
				// deal with background images
				img = programme.getElementsByTagName('img')[0];
				dataset = dom.getDataset(img);
				if (dataset.src) { img.src = dataset.src; }
				// create a disc and addit to navigator
				disc = _disc.cloneNode(true);
				disc.setAttribute('data-index',i);
				_navigator.appendChild(disc);
			}

			// select first
			_navigator.firstChild.className = DISC_CLASS + SELECTED_CLASS;

			// add navigator and playpause to carousel
			_carousel.appendChild(_navigator);
			_carousel.appendChild(_playpause);	
		}	

		// Add a click handler for navigation
		_navigator.addEventListener('click', discHandler);

		// check the viewport size
		sizeHandler();

		// start timer
		timer.start();

		return this;
	}

	function finalize() {

		// stop timer
		timer.stop();

		if (_navigator) {
			_navigator.removeEventListener('click', timer.restart);
		}
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