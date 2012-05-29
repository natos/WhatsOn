/*
* Modal Window
* ------------
* @class Modal
*/

define([

], function Modal() {

	var active = false,

		$body = $(document.body),

		$window = $(window),

		$container = $('<div class="modal"><h1>modal</h1></div>'),

		$closeButton = $('<i class="icon-remove-sign">'),

		$dimmer = $('<div class="dimmer">');

/* private */

	function initialize() {
		// create layout and stuff
		createLayout();

		$closeButton.on('click', hide);
		$dimmer.on('click', hide);
		$window.on('resize', setPosition);
	};

	function createLayout() {
		$container.appendTo($body);
		$dimmer.appendTo($body);
	};

	function remove() {
		$container.appendTo($body);
		$dimmer.remove();
	}

	function show(content) {
		if (!content) { return; }
		setContent(content);
		$container.addClass('active');
		$dimmer.addClass('active');
		$container.addClass('on');
		$dimmer.addClass('on');
		active = true;

		setTimeout(setPosition(), 1);
	};

	function hide() {
		$container.removeClass('on');
		$dimmer.removeClass('on');
		setTimeout(function(){
			$container.removeClass('active');
			$dimmer.removeClass('active');
		}, 300);
		active = false;
	};

	function setContent(content) {
		$container.html(content).append($closeButton);
	};

	function setPosition() {
		if (!active) { return; }

		var top = 400,
			left = (document.body.clientWidth / 2) - ($container.width() / 2);

		$container.css({
			top: top,
			left: left
		});
	}

/* public */

	return {
		initialize: initialize,
		setContent: setContent,
		$container: $container,
		show: show,
		hide: hide
	}

});