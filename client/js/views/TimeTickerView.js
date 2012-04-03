// TimeTickerView.js

define([

],

function() {

	return Backbone.View.extend({

		el: $('<div class="timer-ticker">') // DOM element

	,	content: $('#content')

	,	initialize: function(zeroTime, initialOffsetHoursBetweenZeroTimeAndNow, hourWidth) {

			this.zeroTime = zeroTime;
			this.hourWidth = hourWidth; // How wide an hour is, in pixels
			this.initialOffsetHoursBetweenZeroTimeAndNow = initialOffsetHoursBetweenZeroTimeAndNow;

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.el.appendTo($('#grid-container'));

			this.tick();

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.remove();

			this.trigger('view-unloaded', this);

			return this;

		}

	,	tick: function() {

			var self = this;
			this.draw();
			this.timer = setTimeout(function(){ self.tick.apply(self) }, 1000 * 5); // update 1x per minute

		}

	,	draw: function() {

			var now = new Date();
			var hoursBetweenZeroTimeAndNow = (now.valueOf() - this.zeroTime.valueOf()) / (1000 * 60 * 60) + this.initialOffsetHoursBetweenZeroTimeAndNow;
			var pixelsBetweenZeroTimeAndNow = hoursBetweenZeroTimeAndNow * this.hourWidth;
			this.el.css('left', pixelsBetweenZeroTimeAndNow);

		}

	});

}); // define