/*
* CarouselComponent
* -----------------
* @class Carousel
* TODO: Swipe events to navigate the carousel content
*/

define([

	'utils/dom'

], function CarouselComponentScope(dom) {

	var name = 'carousel',

/* private */

	DISC_CLASS = 'disc icon-certificate',
	SELECTED_CLASS = ' selected',

	transform,
	rowing = true,

	// dom elements
	_playpause,
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
				showCarouselItemForDisc(disc.nextSibling);
			} else {
				showCarouselItemForDisc(_navigator.firstChild);
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
		showCarouselItemForDisc(event.target);
	}

	function showCarouselItemForDisc(target) {
		var transform, property, opera, i, dataset;
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
		} else {
			timer.start();
			this.getElementsByTagName('i')[0].className = 'icon-pause';
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

		$.getJSON('http://platform.tvbuzz.nl/api/ie/buzz/now?l=0,10&callback=?', function(response){
				console.log(response);
		});

		return this;
	}

	function render() {



		_carousel = dom.element('div', { id: 'featured', class: 'carousel'} );
		_list = dom.element('ul', { class: 'show slide' });

		_carousel.appendChild(_list);

		// reset position
		slide(_list).to(0);

		// define the kind of transformation
		// this is because we normally use
		// translate3d and opera doesn't support it
		transform = getTransformProperty(_list);

		var dataset, i = 0, img, disc,
			programme, programmes = _carousel.getElementsByTagName('li'),
			_pauseIcon = dom.element('i', { class: 'icon-pause' }),
			_disc = dom.element('i', { class: DISC_CLASS });
			_navigator = dom.element('div', { id: 'carouselNavigator', class: 'navigator' });

		// have no programmes?
		if (programmes.length <= 0) {
			console.log('Carousel','No TV Tips available.');
			// force finalization
			finalize();
			return;
		}

		_playpause = dom.element('div', { id: 'playpause' });
		_playpause.appendChild(_pauseIcon);
		_playpause.addEventListener('click', playpauseHandler);

		for (i; i < programmes.length; i++) {
			programme = programmes[i];
			// position the list element
			slide(programme).to(i); // nice eh?
			// deal with background images
			img = programme.getElementsByTagName('img')[0];
			dataset = dom.getDataset(img);
			if (dataset.src) { img.src = dataset.src; }
			// create a disc and addit to navigator
			disc = _disc.cloneNode(true);
			disc.setAttribute('data-index', i);
			_navigator.appendChild(disc);
		}

		// select first
		if (_navigator.firstChild) {
			_navigator.firstChild.className = DISC_CLASS + SELECTED_CLASS;
		}

		// add navigator and playpause to carousel
		_carousel.appendChild(_navigator);
		_carousel.appendChild(_playpause);

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

		// remove browser listeners
		window.removeEventListener('resize', sizeHandler);
		window.removeEventListener('orientationchange', sizeHandler);

		// reset carousel className
		_carousel = document.getElementById('featured');
		_carousel.className = 'no-carousel';

		// We need to remove UI buttons, because when it re-renders,
		// we loose reference to DOM Interfaces, they are created
		// every time the component starts
		if (_navigator && _navigator.parentNode) { 
			_navigator.removeEventListener('click', timer.restart);
			_carousel.removeChild(_navigator); 
		}
		
		if (_playpause && _playpause.parentNode) { 
			_playpause.removeEventListener('click', playpauseHandler); 
			_carousel.removeChild(_playpause);
		}

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