/**
*	List
*/

define([

/**
*	@requires
*/

],


/**
*	@class List
*/

function(config) {

	/** @private */

	var	_isArray = function(o) { return Object.prototype.toString.apply(o) === "[object Array]"; };


	/** @constructor */

	var List = function(data) {

		// creates a empty collection
		this.children = [];

		// add data directly
		if (data) { this.add(data); }

		return this;

	};


	/** @public */

	/** collection */ 
	List.prototype.children = [];

	/** add new child */
	List.prototype.add = function(child) {

		if ( _isArray( child ) ) {
			var i = 0, t = child.length;
			for ( i; i < t; i++ ) {
				this.children.push(child[i]);
			}			
			return this.children;
		}

		return this.get( this.children.push(child) );

	};

	/** remove child */
	List.prototype.remove = function(q) {

		// null search return
		if (!q) {
			return this;
		}

		var remove = function(t) {

			return this.children.splice( t , 1 )[0];

		};

		return this.get(q, remove);

	};

	/** return a childemento from the list */
	List.prototype.get = function(q, a) {
		// null search return the entire collection
		if (!q) {
			return this.children;
		}

		var c = typeof q;
		// number? return a specific position
		if ( c === "number" ) {
			q--; // _children is a Zero-index based collection
			return ( a ) ? a.call( this , q ) : this.children[q] ;
		}

		// string? ok, let's find it
		var t = this.size(), _prop, child;
		if ( c === "string" || c === "object" ) {
			while ( t-- ) {
				child = this.children[t];
				// object or string strict equal
				if ( child === q ) {
					return ( a ) ? a.call( this , t ) : child ;
				}
				// if isn't finded yet
				// search inside an object for a string
				for ( _prop in child ) {
					if ( _prop === q || child[_prop] === q ) {
						return ( a ) ? a.call( this , t ) : child ;
					}
				} // end for
			} // end while
		}
	};

	/** return the size of the list */
	List.prototype.size = function() {

		return this.children.length;

	};


	/** overrida metadata */
	List.prototype.override = function(data, key) {

		if (!key) { return; }

		var self = this,
			found = false,
			_children = [];

		if ( _isArray(data) ) {

			// compare each new children with all actual children
			data.forEach(function(newChild, e) {
				self.children.forEach(function(child, i) {
					// Erase repeated and add the new one
					if (child[key] === newChild[key]) {
						found = true;
						self.remove(child[key]);
						_children.push(newChild);
					}
				});
				// If there's no match, just add the new one
				if (!found) {
					_children.push(newChild);
				}

			});

			// merge the collection
			this.add(_children);

			return this;	
		}

		// for single adds
		this.remove(data[key]);
		this.add(data);

		return this;
		
	};

	/** you know, do something for each child */
	List.prototype.each = function(callback) {

		this.children.forEach(callback);

		return this;

	};

	/** @return */

	return List;

});