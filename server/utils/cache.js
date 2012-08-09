/**
 *	Cache singleton object.
 *
 *  TODO: At the moment this is a basic in-memory cache. We can easily turn 
 *  this into a facade for ANY kind of out-of-process or persistent 
 *  back-end cache (memcached, redis, etc.)
 */

define([

	/** @require */

],

/**
 *	@class Cache
 *	@singleton
 */

function() {

	var cache = {};

	var _cachedValues = {};
	var _cachedValuesExpiryDates = {};

	var _clearKey = function(key) {
		if (key && typeof(key)==='string') {
			if (_cachedValues[key]) {
				delete _cachedValues[key];
			}
			if (_cachedValuesExpiryDates[key]) {
				delete _cachedValuesExpiryDates[key];
			}
		}
	};


	/**
	* Set a value in cache
	* @param key {string}
	* @param value {object}
	* @param expires {Number} time-to-live, in seconds
	*/
	cache.set = function(key, value, expires) {
		var expiryDate = null;
		var now;
	
		if (key && typeof(key)==='string') {
			_cachedValues[key] = value;
			if (expires && typeof(expires)==='number') {
				now = new Date();
				expiryDate = new Date( now.valueOf() + (expires * 1000) );
			}
			_cachedValuesExpiryDates[key] = expiryDate;
		}
	};

	/**
	* Get a value from cache
	*/
	cache.get = function(key){
		var value = null;
		var now;

		if (key && typeof(key)==='string') {
			value = _cachedValues[key];
			if (value) {
				expiryDate = _cachedValuesExpiryDates[key];
				if (expiryDate) {
					now = new Date();
					if (now.valueOf() >= expiryDate.valueOf()) {
						_clearKey(key);
						value = null;
					}
				}
			} else {
				_clearKey(key);
				value = null;
			}
		}

		return value;
	};

	/**
	* Clear a value from cache
	*/
	cache.clear = function(key) {
		_clearKey(key);
	};


	/** @return */

	return cache;

});