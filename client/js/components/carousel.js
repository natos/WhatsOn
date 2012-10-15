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

	data = false,

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


	function renderProgrammes(tips) {

		// have no programmes?
		if (!tips) {
			console.log('<CAROUSEL>', 'No programmes available.');
			return;
		}

		// define the type of transformation
		// this is because we normally use
		// translate3d and opera doesn't support it
		transform = getTransformProperty(_list);
		// reset position
		slide(_list).to(0);

		var i = 0, disc, tip, _programme, _details, _title, _channel, _container,
			_pauseIcon = dom.element('i', { class: 'icon-pause' }),
			_disc = dom.element('i', { class: DISC_CLASS });
			_navigator = dom.element('div', { id: 'carouselNavigator', class: 'navigator' });

		// create playpause button
		_playpause = dom.element('div', { id: 'playpause' });
		_playpause.appendChild(_pauseIcon);
		_playpause.addEventListener('click', playpauseHandler);

		for (i; i < tips.length; i++) {
			tip = tips[i];
			// build dom programme
			_programme = dom.element('li', { class: 'programme' });
			// deal with background images
			_programme.appendChild(dom.element('img', { class: 'programme-bg', 'src': tip.programme.imageUrl }));
			// add details
			_details = dom.element('div', { class: 'programme-details'});
				// create title
				_title = dom.element('a', { href: '/programme/' + tip.id[0] });
				_title.innerHTML = tip.programme.title;
				// create title container
				_container = dom.element('h1');
				_container.appendChild(_title);
				// append title container to _details
			_details.appendChild(_container);
				// create channel link
				_channel = dom.create('a', { href: '/channel/' + tip.channel.id[0] });
				_channel.innerHTML = tip.channel.name[0];
				// create channel link container
				_container = dom.element('p');
				_container.appendChild(_channel);
			// append channel container
			_details.appendChild(_container);
			// append details to programme
			_programme.appendChild(_details);
			// position the list element
			slide(_programme).to(i); // nice eh?
			// append to list
			_list.appendChild(_programme);
			// create a disc and addit to navigator
			disc = _disc.cloneNode(true);
			disc.setAttribute('data-index', i);
			_navigator.appendChild(disc);
		}

		// GC
		i = null;
		tip = null;
		tips = null;
		disc = null;
		_disc = null;
		_programme = null;
		_details = null;
		_title = null;
		_channel = null;
		_container = null;

		// select first
		if (_navigator.firstChild) {
			_navigator.firstChild.className = DISC_CLASS + SELECTED_CLASS;
		}

		// Add a click handler for navigation
		_navigator.addEventListener('click', discHandler);

		// add content list 
		_carousel.appendChild(_list);
		// add navigator and playpause to carousel
		_carousel.appendChild(_navigator);
		_carousel.appendChild(_playpause);
		// check the viewport size
		sizeHandler();

		// start timer
		timer.start();
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
			element.style[transform] = property + '(' + (100 * point) + ((opera) ? '%)' : '%, 0, 0)');
		}

		return { // yeah, I like currying
			to: toPoint
		}
	}

/* public */ 

	function initialize() {

		_carousel = dom.element('section', { id: 'featured', class: 'carousel'} );
		_list = dom.element('ul', { class: 'show slide' });

		window.addEventListener('resize', sizeHandler);
		window.addEventListener('orientationchange', sizeHandler);

		return this;
	}

	function render() {

		// TODO: Add loader to carousel layout 
		console.log('loading carousel')

		// append to dom
		dom.doc.getElementById('dashboard-content').appendChild(_carousel);

		require(['json!http://enigmatic-hamlet-2742.herokuapp.com/nl/tvtips.json'], renderProgrammes);

		return this;
	}

	function finalize() {

		// stop timer
		timer.stop();

		// remove browser listeners
		window.removeEventListener('resize', sizeHandler);
		window.removeEventListener('orientationchange', sizeHandler);

		// reset carousel className
		_carousel.className = 'no-carousel';

		_navigator.removeEventListener('click', timer.restart);
		_playpause.removeEventListener('click', playpauseHandler); 

		// We need to remove UI buttons, because when it re-renders,
		// we loose reference to DOM Interfaces, they are created
		// every time the component starts
		_carousel.removeChild(_navigator); 
		_carousel.removeChild(_playpause);
		_carousel.removeChild(_list);
		// remove carousel
		dom.doc.getElementById('dashboard-content').removeChild(_carousel);

		_list = null;
		_carousel = null;
		_navigator = null;
		_playpause = null;

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