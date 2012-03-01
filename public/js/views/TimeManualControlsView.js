// TimeManualControlsView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('#time-controls') // DOM element

	,	moveTop: $('.move-top')

	,	moveRight: $('.move-right')

	,	moveBottom: $('.move-bottom')

	,	moveLeft: $('.move-left')

	,	BAR_WIDHT: 50

	,	MARGIN_LEFT: 63

	,	MARGIN_TOP: 70

	,	MARGIN_RIGHT: 0

	,	MARGIN_BOTTOM: 0

	,	initialize: function() {

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.remove();

			this.trigger('view-unloaded', this);

			return this;

		}

	,	update: function(viewport) {

			console.log(viewport);

			var offsetTop = viewport.top + this.MARGIN_TOP
			,	offsetBottom = viewport.top + viewport.height + this.MARGIN_BOTTOM
			,	offsetLeft = viewport.left + this.MARGIN_LEFT
				/* offsetRight but from the left CSS property */
			,	offsetRight = viewport.left + viewport.width - this.BAR_WIDHT - this.MARGIN_RIGHT 
			,	width = viewport.width - this.MARGIN_RIGHT - this.MARGIN_LEFT
			,	height = viewport.height - this.MARGIN_TOP - this.MARGIN_BOTTOM;

			// move things
			this.moveTop.css({
				'top'	: offsetTop
			,	'left'  : offsetLeft
			,	'width'	: width
			,	'height': this.BAR_WIDTH
			});

			this.moveRight.css({
				'top'	: offsetTop
			,	'bottom': offsetBottom
			,	'left' : offsetRight /* I guess this way is easier */
			,	'width' : this.BAR_WIDHT
			,	'height': height
			});

			this.moveBottom.css({
				'top'	: viewport.top + viewport.height - this.BAR_WIDHT
			,	'left'  : offsetLeft
			,	'width'	: width
			,	'height': this.BAR_WIDTH
			});

			this.moveLeft.css({
				'top'	: offsetTop
			,	'bottom': offsetBottom
			,	'left'  : offsetLeft
			,	'width' : this.BAR_WIDHT
			,	'height': height
			});

		}

	});

}); // define