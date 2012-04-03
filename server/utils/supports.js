/**
*	Supports
*/

define([

/**
*	@requires
*/
	'useragent'
,	'useragent/features'

],


/**
*	@class Supports
*/

function(useragent, useragent_features) {

	useragent(true); // Update useragent regex library

	/** @private */

	/** @constructor */

	var Supports = function(req) {

		var uaString = req.headers['user-agent'],
			agent = useragent.parse(uaString),
			family = agent.family.toLowerCase();

		/**
		 * Whether the user agent supports CSS fixed position elements.
		 * Assumption: new browsers support position:fixed. Only old
		 * browsers do not support it. Therefore, we only need to identify
		 * and reject old browsers. This is more maintainable than the opposite:
		 * the list of old (incapable) browsers is (mostly) known and static. 
		 * The list of new (capable) browsers grows every day.
		 */
		this.CSSFixedPosition = function() {
			var supported = true,
				identified = false;

			// Note: (iPad + iPhone) and (iPod Touch) version detects are different.
			// (iPad + iPhone) agent object holds the iOS version
			// (iPod Touch) agent object holds the Mobile Safari version
			// See regexes in http://ua-parser.googlecode.com/svn/trunk/resources/user_agent_parser.yaml
			if (!identified && (['ipad','iphone'].indexOf(family) !== -1)) {
				if (agent.satisfies('<5.0.0')) { // iOS version number
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'ipod')) {
				if (agent.satisfies('<5.1.0')) { // Safari version number
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'android')) {
				if (agent.satisfies('<2.2.0')) {
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'ie mobile')) {
				if (agent.satisfies('<=9.0.0')) {
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'blackberry')) {
				if (agent.satisfies('<=7.0.0')) {
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'opera mobile')) {
				if (agent.satisfies('<12.0.0')) {
					supported = false;
					identified = true;
				}
			}
			if (!identified && (family === 'opera mini')) {
				supported = false;
				identified = true;
			}

	//		console.log("supports CSSFixedPosition = " + supported);
			return supported;
		}
	}

	/** @public */
 
	/** @return */

	return Supports;

});