
/*
 * Timer
 * Use new Timer('Label') to start tracking
 * Use Timer.track('Lable') to record a timestamp
 */
var Timer = function(name) {

	this.prefix = ' Timer > ';
	this.name = name;
	this.now = new Date();

	return this;

}

Timer.prototype.track = function(str) {

	var time = new Date();
	var timeDiff = time.valueOf() - this.now.valueOf()

	console.log( this.prefix + (this.name ? this.name : '') + ' > ' + str + ': ' + (timeDiff/1000) + 's (' + timeDiff + ')' );

}

if (typeof exports !== 'undefined') {

	if (typeof module !== 'undefined' && module.exports) {

		exports = module.exports = Timer;

	}

	exports.Timer = Timer;

}

