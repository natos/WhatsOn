// TimeTickerView.js



// TODO: Fix time bars so we can place the TimeTicker centered on the screen


define([

],

function() {

	return Backbone.View.extend({

		el: $('<div class="timer-ticker">') // DOM element

	,	content: $('#content')

	,	SECOND_WIDTH: 3 // px

	,	initialize: function(zeroTime) {

			this.zeroTime = zeroTime;

			this.trigger('view-initialized', this);

			this.load();

			return this;
		}

	,	load: function() {

			this.el.appendTo(this.content);

			this.startTicker();

			this.trigger('view-created');

			return this;

		}

	,	unload: function() {

			this.el.remove();

			this.trigger('view-unloaded', this);

			return this;

		}

	,	startTicker: function() {

			this.time = 0;
			this.tick();

		}

	,	tick: function() {

			var self = this;

			this.offsetLeft = Math.floor( this.time ); // * this.SECOND_WIDTH ); // pixels

console.log(this.time);

			this.el.css('left', this.offsetLeft);

			this.timer = setTimeout(function(){ self.tick.apply(self) }, 18000); // every second 18ms

			this.time = this.time + 1;

		}

	});

}); // define